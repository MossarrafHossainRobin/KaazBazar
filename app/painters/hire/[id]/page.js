"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PaintBucket, MapPin, User, CheckCircle, Phone, Brush, Clock, DollarSign, Palette } from "lucide-react";
import { getPainterById } from '@/app/data/painters'; 

export default function PainterHirePage() {
    const params = useParams();
    const { id } = params || {};

    const [profile, setProfile] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        clientName: '',
        clientPhone: '',
        serviceType: '',
        projectSize: 'Small (1-2 Rooms)',
        date: '',
        time: '',
        message: ''
    });

    useEffect(() => {
        if (!id) return;
        const data = getPainterById(id);
        setProfile(data);
    }, [id]);

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                    <PaintBucket className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Painter Not Found</h1>
                    <p className="text-gray-600">The profile with ID: <strong>{id || "unknown"}</strong> could not be loaded for booking.</p>
                    <a href="/services/painters" className="mt-4 inline-block text-indigo-600 hover:underline">
                        &larr; Back to Directory
                    </a>
                </div>
            </div>
        );
    }

    const dynamicColor = profile.color || "#6366f1";

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Painting booking request submitted. Data:", {
            painterId: id,
            painterName: profile.name,
            requestDetails: formData
        });
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden mt-10 border-t-8" style={{borderColor: dynamicColor}}>

                {/* Header */}
                <div className="p-8" style={{backgroundColor: `${dynamicColor}10`}}>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center mb-2">
                        <Palette className="w-8 h-8 mr-3" style={{color: dynamicColor}} />
                        Request a Quote from <strong>{profile.name}</strong>
                    </h1>
                    <p className="text-lg text-gray-600">
                        Detail your project to get an accurate estimate. Starting at <strong>${profile.price}/hr</strong>.
                    </p>
                </div>

                <div className="p-8">
                    {isSubmitted ? (
                        <div className="text-center py-16">
                            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-gray-800 mb-3">Booking Request Sent!</h2>
                            <p className="text-lg text-gray-600">
                                <strong>{profile.name}</strong> will contact you within <strong>{profile.responseTime}</strong> at <strong>{formData.clientPhone}</strong> to discuss project scope and finalize the appointment.
                            </p>
                            <a href="/services/painters" className="mt-6 inline-block px-6 py-3 text-white font-semibold rounded-lg hover:brightness-110 transition-colors" style={{backgroundColor: dynamicColor}}>
                                Explore More Services
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Painter Info Block */}
                            <div className="p-5 border-2 rounded-xl" style={{borderColor: dynamicColor, backgroundColor: `${dynamicColor}10`}}>
                                <h3 className="text-xl font-semibold mb-3 flex items-center" style={{color: dynamicColor}}>
                                    <User className="w-5 h-5 mr-2" />
                                    Your Chosen Expert
                                </h3>
                                <div className="flex items-center space-x-4">
                                    <img src={profile.imageUrl} alt={profile.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md" style={{borderColor: dynamicColor}} />
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{profile.name}</p>
                                        <p className="text-sm text-gray-700">{profile.title}</p>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 mr-1" />{profile.location}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-4 border-b pb-4">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <Phone className="w-5 h-5 mr-2" style={{color: dynamicColor}} />
                                    Your Contact Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">Your Full Name</label>
                                        <input type="text" id="clientName" value={formData.clientName} onChange={handleChange} required placeholder="Jane Doe" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input type="tel" id="clientPhone" value={formData.clientPhone} onChange={handleChange} required placeholder="(555) 123-4567" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Project Details */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <Brush className="w-5 h-5 mr-2" style={{color: dynamicColor}} />
                                    Project Scope
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">Primary Service</label>
                                        <select id="serviceType" value={formData.serviceType} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                                            <option value="" disabled>-- Select a Service Type --</option>
                                            {profile.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="projectSize" className="block text-sm font-medium text-gray-700 mb-2">Project Size Estimate</label>
                                        <select id="projectSize" value={formData.projectSize} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                                            <option>Small (1-2 Rooms)</option>
                                            <option>Medium (Full Floor/Exterior)</option>
                                            <option>Large (Whole House/Commercial)</option>
                                            <option>Custom Mural/Artistic Finish</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Date and Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Target Start Date</label>
                                        <input type="date" id="date" value={formData.date} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Time</label>
                                        <input type="time" id="time" value={formData.time} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Describe Your Vision / Specific Needs</label>
                                    <textarea id="message" rows="4" value={formData.message} onChange={handleChange} required placeholder="e.g., Living room painted in light gray, accent wall navy blue." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" className="w-full flex items-center justify-center py-4 text-white text-xl font-bold rounded-xl hover:brightness-110 transition-all duration-200 shadow-xl" style={{backgroundColor: dynamicColor, boxShadow: `0 10px 15px -3px ${dynamicColor}80`}}>
                                <PaintBucket className="w-6 h-6 mr-3" />
                                Send Quote Request
                            </button>

                            <a href={`/painters/profile/${id}`} className="block text-center text-sm font-semibold hover:underline mt-4" style={{color: dynamicColor}}>
                                Review Portfolio Before Booking
                            </a>
                        </form>
                    )}
                </div>
            </div>

            <div className="h-20"></div>
        </div>
    );
}
