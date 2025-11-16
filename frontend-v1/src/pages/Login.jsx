import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import backgroundImage from '@/assets/images/6e432d72ffa8381a97638a0e3e0b8fa6.jpg';
import logoImage from '@/assets/images/logo.png';
import * as authService from '../services/authService';
import * as logger from '../utils/logger';

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        username: "",
        password: "",
        general: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset errors
        setErrors({ username: "", password: "", general: "" });

        // Validate username
        if (!username.trim()) {
            setErrors(prev => ({ ...prev, username: "El campo Usuario es obligatorio" }));
        }

        // Validate password
        if (!password.trim()) {
            setErrors(prev => ({ ...prev, password: "El campo Contraseña es obligatorio" }));
        }

        // If there are errors, don't proceed
        if (!username.trim() || !password.trim()) {
            return;
        }

        setIsLoading(true);

        try {
            // Call login API
            logger.info('LOGIN_ATTEMPT', `User ${username} attempting login`);

            const response = await authService.login(username, password);

            logger.success('LOGIN_SUCCESS', `User ${username} logged in successfully`, {
                token: response.token ? 'Token received' : 'No token',
                expiresAt: response.expiresAt
            });

            // Navigate to dashboard after successful login
            navigate('/dashboard');
        } catch (error) {
            logger.error('LOGIN_FAILED', `Login failed for user ${username}`, {
                error: error.message,
                status: error.response?.status
            });

            // Handle different error types
            if (error.response?.status === 401) {
                setErrors(prev => ({
                    ...prev,
                    general: "Usuario o contraseña incorrectos"
                }));
            } else if (error.response?.status === 0) {
                setErrors(prev => ({
                    ...prev,
                    general: "No se pudo conectar con el servidor. Verifica tu conexión."
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    general: error.message || "Error al iniciar sesión. Intenta nuevamente."
                }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="bg-[rgba(239,239,239,0.89)] border-[8px] border-[#394557] px-8 py-16 rounded-2xl shadow-md w-96 text-center backdrop-blur-sm" style={{ marginTop: '-200px' }}>
                <img
                    src={logoImage}
                    alt="logo"
                    className="mx-auto w-64 h-64 mb-4 object-contain"
                    onError={(e) => {
                        console.error('Error loading logo:', e);
                        e.target.style.display = 'none';
                    }}
                />

                {/* Error general */}
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campo Usuario */}
                    <div className="relative">
                        <input
                            type="text"
                            id="username"
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`w-full py-1 px-4 pr-10 text-center rounded-full border transition-all focus:outline-none
                                ${errors.username
                                    ? "border-red-500 text-red-600 placeholder-red-400"
                                    : "border-gray-300 focus:border-[#394557]"
                                }`}
                        />
                        {errors.username && (
                            <XCircleIcon className="h-5 w-5 text-red-500 absolute right-4 top-1" />
                        )}
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1 text-center">
                                {errors.username}
                            </p>
                        )}
                    </div>

                    {/* Campo Contraseña */}
                    <div className="relative">
                        <input
                            type="password"
                            id="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full py-1 px-4 pr-10 text-center rounded-full border transition-all focus:outline-none
                                ${errors.password
                                    ? "border-red-500 text-red-600 placeholder-red-400"
                                    : "border-gray-300 focus:border-[#394557]"
                                }`}
                        />
                        {errors.password && (
                            <XCircleIcon className="h-5 w-5 text-red-500 absolute right-4 top-1" />
                        )}
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 text-center">
                                {errors.password}
                            </p>
                        )}
                    </div>

                        <button
                            id="log-in"
                            type="submit"
                            disabled={isLoading}
                            className={`bg-[#121648] text-white uppercase font-semibold py-3 px-6 rounded-full w-3/4 transition-all duration-200 flex items-center justify-center gap-2 mx-auto ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Iniciando sesión...</span>
                                </>
                            ) : (
                                <>
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                    <span>Iniciar sesión</span>
                                </>
                            )}
                        </button>
                </form>

            </div>

            {/* Footer Link - Bottom Right */}
            <div className="absolute bottom-4 right-4 text-lg">
                <a
                    href="https://printers.apk.lol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#51cbce] hover:underline text-lg"
                >
                    Descargar Drivers de printers
                </a>
                <p className="text-white text-base mt-1">
                    Firefox Silent Print: <span className="font-bold italic">print.always_print_silent</span>
                </p>
            </div>
        </div>
    );
}
