import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Inline confirmation dialog that replaces window.confirm().
 * Renders as a fixed-bottom toast-style bar.
 *
 * Usage:
 *   const [confirm, setConfirm] = useState(null);
 *
 *   // To trigger:
 *   setConfirm({
 *     message: 'Delete this resource?',
 *     onConfirm: () => { doDelete(); setConfirm(null); },
 *   });
 *
 *   // In JSX:
 *   <ConfirmDialog config={confirm} onClose={() => setConfirm(null)} />
 */
const ConfirmDialog = ({ config, onClose }) => {
    if (!config) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm w-full animate-in">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-50 rounded-full shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 mb-1">Confirm Action</h3>
                        <p className="text-sm text-gray-600">{config.message}</p>
                    </div>
                </div>

                <div className="flex gap-3 mt-5">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            config.onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        {config.confirmLabel || 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;

