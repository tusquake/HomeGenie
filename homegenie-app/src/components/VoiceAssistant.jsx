// VoiceAssistant.jsx
import { CheckCircle, Loader, Mic, MicOff, Send, Volume2, VolumeX, XCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { API_BASE_MAINTENANCE } from '../utils/constants';

const VoiceAssistant = ({ currentUser, onRequestCreated }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [useTextInput, setUseTextInput] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);

    // Early return if no user
    if (!currentUser) {
        return (
            <div className="bg-red-50 rounded-xl shadow-lg p-6 mb-8 border border-red-200">
                <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-medium">User information is missing. Please log in again.</p>
                </div>
            </div>
        );
    }

    // Start recording audio
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                }
            });

            // Try to use specific MIME types for better compatibility
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                console.log('Audio recorded:', audioBlob.size, 'bytes');
                await sendAudioToBackend(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            // Record in chunks for better data capture
            mediaRecorderRef.current.start(100);
            setIsRecording(true);
            setError(null);
            setResponse(null);
        } catch (err) {
            setError('Microphone access denied. Please enable microphone permissions.');
            console.error('Error accessing microphone:', err);
        }
    };

    // Stop recording audio
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
        }
    };

    // Send audio to backend
    const sendAudioToBackend = async (audioBlob) => {
        // Validate currentUser - check both 'id' and 'userId'
        const userId = currentUser?.id || currentUser?.userId;
        if (!userId) {
            setError('User information is missing. Please refresh the page.');
            setIsProcessing(false);
            return;
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
            const res = await fetch(`${API_BASE_MAINTENANCE}/maintenance/voice/interact`, {
                method: 'POST',
                headers: {
                    'X-User-Id': userId.toString(),
                    'Authorization': `Bearer ${currentUser?.token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Failed to process audio');

            const data = await res.json();
            handleVoiceResponse(data);
        } catch (err) {
            setError('Failed to process voice input. Please try again.');
            console.error('Error sending audio:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Send text to backend
    const sendTextToBackend = async () => {
        if (!textInput.trim()) return;

        const userId = currentUser?.id || currentUser?.userId;
        if (!userId) {
            setError('User information is missing. Please refresh the page.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResponse(null);

        try {
            const res = await fetch(`${API_BASE_MAINTENANCE}/maintenance/voice/interact-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId.toString(),
                    'Authorization': `Bearer ${currentUser?.token}`
                },
                body: JSON.stringify({
                    transcribedText: textInput,
                    conversationId: response?.conversationId || null
                })
            });

            if (!res.ok) throw new Error('Failed to process text');

            const data = await res.json();
            handleVoiceResponse(data);
            setTextInput('');
        } catch (err) {
            setError('Failed to process your request. Please try again.');
            console.error('Error sending text:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle voice response
    const handleVoiceResponse = (data) => {
        setTranscribedText(data.transcribedText || textInput);
        setResponse(data);

        // Notify parent component if a ticket was created
        if (data.createdTicket && onRequestCreated) {
            onRequestCreated(data.createdTicket);
        }

        // Auto-play audio response if available
        if (data.audioResponseBase64) {
            playAudioResponse(data.audioResponseBase64);
        }
    };

    // Play audio response
    const playAudioResponse = (base64Audio) => {
        try {
            const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
            audioRef.current = audio;
            audio.onplay = () => setIsPlayingAudio(true);
            audio.onended = () => setIsPlayingAudio(false);
            audio.onerror = () => {
                console.error('Error playing audio');
                setIsPlayingAudio(false);
            };
            audio.play().catch(err => {
                console.error('Failed to play audio:', err);
                setIsPlayingAudio(false);
            });
        } catch (err) {
            console.error('Error creating audio:', err);
        }
    };

    // Stop audio playback
    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlayingAudio(false);
        }
    };

    // Handle example click
    const handleExampleClick = (example) => {
        setUseTextInput(true);
        setTextInput(example);
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 rounded-2xl shadow-xl p-6 md:p-8 mb-8 text-white relative overflow-hidden animate-fade-in">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                                <Mic className="w-6 h-6" />
                            </div>
                            Smart Voice Assistant
                        </h3>
                        <p className="text-white/80 text-sm mt-1">Create requests with voice or text</p>
                    </div>
                    <button
                        onClick={() => setUseTextInput(!useTextInput)}
                        className="text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all duration-300 backdrop-blur border border-white/30"
                    >
                        {useTextInput ? '🎤 Microphone' : '⌨️ Text'}
                    </button>
                </div>

                {/* Voice/Text Input Area */}
                <div className="space-y-4">
                    {!useTextInput ? (
                        // Voice Recording
                        <div className="flex flex-col items-center gap-4 py-6">
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isProcessing}
                                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl font-bold text-lg ${isRecording
                                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                    : 'bg-white text-blue-600 hover:bg-yellow-50'
                                    }`}
                            >
                                {isRecording ? (
                                    <MicOff className="w-10 h-10" />
                                ) : (
                                    <Mic className="w-10 h-10" />
                                )}
                            </button>
                            {isRecording && (
                                <span className="text-sm font-bold text-yellow-200 animate-pulse">
                                    🔴 Recording... Tap to stop
                                </span>
                            )}
                            {!isRecording && !isProcessing && (
                                <p className="text-sm text-center text-white/90">
                                    Tap the microphone to start recording your request
                                </p>
                            )}
                        </div>
                    ) : (
                        // Text Input
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendTextToBackend()}
                                placeholder="Type your maintenance request..."
                                className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none bg-white/90 text-gray-900 font-medium placeholder-gray-500"
                                disabled={isProcessing}
                            />
                            <button
                                onClick={sendTextToBackend}
                                disabled={isProcessing || !textInput.trim()}
                                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg font-bold hover:shadow-xl"
                            >
                                <Send className="w-5 h-5" />
                                Send
                            </button>
                        </div>
                    )}

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <div className="flex items-center justify-center gap-2 text-white py-2 bg-white/10 rounded-lg backdrop-blur border border-white/20">
                            <Loader className="w-5 h-5 animate-spin" />
                            <span className="font-semibold">Processing...</span>
                        </div>
                    )}

                    {/* Transcribed Text */}
                    {transcribedText && (
                        <div className="bg-white/15 rounded-lg p-4 border border-white/30 backdrop-blur">
                            <p className="text-sm font-bold text-white/80 mb-1">You said:</p>
                            <p className="text-white text-lg">{transcribedText}</p>
                        </div>
                    )}

                    {/* Response */}
                    {response && (
                        <div className="bg-white/15 rounded-lg p-4 border border-white/30 backdrop-blur space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white/80 mb-2">Assistant Response:</p>
                                    <p className="text-white">{response.textResponse}</p>
                                </div>
                                {response.audioResponseBase64 && (
                                    <button
                                        onClick={isPlayingAudio ? stopAudio : () => playAudioResponse(response.audioResponseBase64)}
                                        className="flex-shrink-0 p-2 rounded-lg hover:bg-white/20 transition-colors"
                                        title={isPlayingAudio ? "Stop audio" : "Play audio"}
                                    >
                                        {isPlayingAudio ? (
                                            <VolumeX className="w-5 h-5 text-yellow-300" />
                                        ) : (
                                            <Volume2 className="w-5 h-5 text-white" />
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Created Ticket Info */}
                            {response.createdTicket && (
                                <div className="bg-white/10 rounded-lg p-4 border border-white/20 mt-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="w-5 h-5 text-green-300" />
                                        <span className="font-bold text-white">Request Created!</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm text-white/90">
                                        <div className="flex flex-col">
                                            <span className="text-white/60 text-xs">Ticket #</span>
                                            <span className="font-bold text-white">#{response.createdTicket.id}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white/60 text-xs">Category</span>
                                            <span className="font-bold text-white">{response.createdTicket.category}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white/60 text-xs">Priority</span>
                                            <span className={`font-bold ${response.createdTicket.priority === 'CRITICAL' ? 'text-red-300' :
                                                response.createdTicket.priority === 'HIGH' ? 'text-orange-300' :
                                                    response.createdTicket.priority === 'MEDIUM' ? 'text-yellow-300' :
                                                        'text-green-300'
                                                }`}>
                                                {response.createdTicket.priority}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white/60 text-xs">Status</span>
                                            <span className="font-bold text-cyan-300">{response.createdTicket.status}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-sm">
                            <div className="flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-600" />
                                <p className="text-red-800 font-medium">{error}</p>
                            </div>
                        </div>
                    )}
                </div>{/* ← closes space-y-4 */}

                {/* Examples */}
                <div className="mt-6 pt-4 border-t border-white/20">
                    <p className="text-xs font-semibold text-white/80 mb-3">💡 Try these examples:</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            "My AC is not working",
                            "There's a water leak in the bathroom",
                            "The lights in the hallway are out",
                            "Emergency! Gas smell in kitchen"
                        ].map((example, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleExampleClick(example)}
                                className="px-3 py-2 bg-white/20 text-white rounded-lg text-xs hover:bg-white/30 transition-colors font-medium border border-white/30"
                            >
                                "{example}"
                            </button>
                        ))}
                    </div>
                </div>
            </div>{/* ← closes relative z-10 */}
        </div>
    );
};

export default VoiceAssistant;