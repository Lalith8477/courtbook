import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import axiosInstance, { getError } from "../axiosCalls/axios"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import Spinner from "../components/Spinner"
import EmptyState from "../components/EmptyState"
import { SPORTS } from "../utils/constants"
import { capitalize } from "../utils/format"

const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

const CourtForm = () => {
    const { id } = useParams()
    const isEdit = Boolean(id)
    const { user } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: "",
        sport: "football",
        description: "",
        area: "",
        city: "",
        address: "",
        pricePerHour: "",
        openTime: "06:00",
        closeTime: "22:00",
        slotDuration: "60",
        isActive: true
    })
    const [existingImages, setExistingImages] = useState([])
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(isEdit)
    const [error, setError] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isEdit) {
            return
        }
        const load = async () => {
            try {
                const res = await axiosInstance.get(`/courts/${id}`)
                const court = res.data.court
                if (court.owner && court.owner._id !== user._id) {
                    setError("You can only edit your own courts")
                    return
                }
                setForm({
                    name: court.name,
                    sport: court.sport,
                    description: court.description || "",
                    area: court.area,
                    city: court.city,
                    address: court.address || "",
                    pricePerHour: String(court.pricePerHour),
                    openTime: court.openTime,
                    closeTime: court.closeTime,
                    slotDuration: String(court.slotDuration),
                    isActive: court.isActive
                })
                setExistingImages(court.images || [])
            } catch (err) {
                setError(getError(err))
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm({ ...form, [name]: type === "checkbox" ? checked : value })
    }

    const handleFiles = (e) => {
        const chosen = Array.from(e.target.files)

        for (const file of chosen) {
            if (!file.type.startsWith("image/")) {
                showToast("Only image files are allowed", "error")
                e.target.value = ""
                setFiles([])
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast("Each image must be under 5MB", "error")
                e.target.value = ""
                setFiles([])
                return
            }
        }

        if (existingImages.length + chosen.length > 5) {
            showToast("A court can have at most 5 images", "error")
            e.target.value = ""
            setFiles([])
            return
        }

        setFiles(chosen)
    }

    const validate = () => {
        if (!form.name.trim()) {
            return "Court name is required"
        }
        if (!form.area.trim()) {
            return "Area is required"
        }
        if (!form.city.trim()) {
            return "City is required"
        }
        if (form.pricePerHour === "" || isNaN(Number(form.pricePerHour)) || Number(form.pricePerHour) < 0) {
            return "Price per hour must be a valid number"
        }
        if (!form.openTime || !form.closeTime) {
            return "Opening and closing time are required"
        }
        if (toMinutes(form.openTime) >= toMinutes(form.closeTime)) {
            return "Closing time must be after opening time"
        }
        if (toMinutes(form.closeTime) - toMinutes(form.openTime) < Number(form.slotDuration)) {
            return "Opening hours are shorter than one slot"
        }
        return ""
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const problem = validate()
        if (problem) {
            showToast(problem, "error")
            return
        }

        const data = new FormData()
        data.append("name", form.name.trim())
        data.append("sport", form.sport)
        data.append("description", form.description.trim())
        data.append("area", form.area.trim())
        data.append("city", form.city.trim())
        data.append("address", form.address.trim())
        data.append("pricePerHour", form.pricePerHour)
        data.append("openTime", form.openTime)
        data.append("closeTime", form.closeTime)
        data.append("slotDuration", form.slotDuration)
        if (isEdit) {
            data.append("isActive", String(form.isActive))
        }
        files.forEach((file) => data.append("images", file))

        setSaving(true)
        try {
            if (isEdit) {
                await axiosInstance.put(`/courts/${id}`, data)
                showToast("Court updated", "success")
            } else {
                await axiosInstance.post("/courts", data)
                showToast("Court created", "success")
            }
            navigate("/owner/courts")
        } catch (err) {
            showToast(getError(err), "error")
        } finally {
            setSaving(false)
        }
    }

    const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"

    if (loading) {
        return <Spinner text="Loading court..." />
    }

    if (error) {
        return (
            <EmptyState title="Cannot open this court" message={error}>
                <Link to="/owner/courts" className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700">
                    Back to my courts
                </Link>
            </EmptyState>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-5">{isEdit ? "Edit court" : "Add a court"}</h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 grid gap-4 sm:grid-cols-2"
            >
                <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Court name</label>
                    <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Green Arena" />
                </div>

                <div>
                    <label className="block text-sm mb-1">Sport</label>
                    <select name="sport" value={form.sport} onChange={handleChange} className={inputClass}>
                        {SPORTS.map((sport) => (
                            <option key={sport} value={sport}>{capitalize(sport)}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">Price per hour</label>
                    <input
                        type="number"
                        name="pricePerHour"
                        min="0"
                        value={form.pricePerHour}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="800"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Area</label>
                    <input name="area" value={form.area} onChange={handleChange} className={inputClass} placeholder="Koramangala" />
                </div>

                <div>
                    <label className="block text-sm mb-1">City</label>
                    <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="Bengaluru" />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Address (optional)</label>
                    <input name="address" value={form.address} onChange={handleChange} className={inputClass} />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Description (optional)</label>
                    <textarea
                        name="description"
                        rows="3"
                        value={form.description}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Opens at</label>
                    <input type="time" name="openTime" value={form.openTime} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                    <label className="block text-sm mb-1">Closes at</label>
                    <input type="time" name="closeTime" value={form.closeTime} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                    <label className="block text-sm mb-1">Slot length</label>
                    <select name="slotDuration" value={form.slotDuration} onChange={handleChange} className={inputClass}>
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                        <option value="120">120 minutes</option>
                    </select>
                </div>

                {isEdit && (
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                            Visible to players
                        </label>
                    </div>
                )}

                <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Photos (up to 5, each under 5MB)</label>

                    {existingImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {existingImages.map((image) => (
                                <img key={image} src={image} alt="" className="h-16 w-20 object-cover rounded-lg" />
                            ))}
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFiles}
                        className="block w-full text-sm"
                    />
                    {files.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {files.length} new photo(s) selected
                        </p>
                    )}
                    {isEdit && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            New photos are added to the existing ones.
                        </p>
                    )}
                </div>

                <div className="sm:col-span-2 flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {saving ? "Saving..." : isEdit ? "Save changes" : "Create court"}
                    </button>
                    <Link
                        to="/owner/courts"
                        className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default CourtForm