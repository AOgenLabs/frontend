/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/context/ApiContext";

export default function AutomationsList() {
    const { automations, isLoading, deleteAutomation, triggerAutomation } =
        useApi();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [triggerData, setTriggerData] = useState("");
    const [actionResult, setActionResult] = useState<any>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteAutomation(id);
        } catch (err) {
            console.error("Failed to delete automation:", err);
        }
    };

    const handleTrigger = async (id: string, when: string) => {
        try {
            const result = await triggerAutomation(id, when, triggerData);
            setActionResult(result);
            setTimeout(() => setActionResult(null), 5000);
        } catch (err) {
            console.error("Failed to trigger automation:", err);
        }
    };

    if (isLoading) {
        return <div className="text-green-400">Loading automations...</div>;
    }

    if (automations.length === 0) {
        return (
            <div className="text-gray-400 italic">
                No automations found. Create one to get started.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-green-400 mb-2">Your Automations</h3>

            {actionResult && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-2 bg-gray-800 border border-green-500 rounded text-xs text-green-300 mb-2"
                >
                    <div className="font-bold">Action Result:</div>
                    <pre className="mt-1 overflow-x-auto">
                        {JSON.stringify(actionResult, null, 2)}
                    </pre>
                </motion.div>
            )}

            {automations.map((automation) => (
                <motion.div
                    key={automation.id}
                    className="border border-gray-700 rounded overflow-hidden bg-gray-800/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                >
                    <div
                        className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-700/30"
                        onClick={() =>
                            setExpandedId(
                                expandedId === automation.id
                                    ? null
                                    : automation.id
                            )
                        }
                    >
                        <div>
                            <div className="text-green-300">
                                {automation.name}
                            </div>
                            <div className="text-xs text-gray-400">
                                When:{" "}
                                <span className="text-blue-300">
                                    {automation.when}
                                </span>{" "}
                                → Then:{" "}
                                <span className="text-purple-300">
                                    {automation.then}
                                </span>
                            </div>
                        </div>
                        <div
                            className={`w-2 h-2 rounded-full ${
                                automation.status === "active"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                            }`}
                        ></div>
                    </div>

                    <AnimatePresence>
                        {expandedId === automation.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-700 p-2 bg-gray-800/50"
                            >
                                <div className="text-xs text-gray-300 mb-2">
                                    <div>
                                        <span className="text-gray-500">
                                            ID:
                                        </span>{" "}
                                        {automation.id}
                                    </div>
                                    <div>
                                        <span className="text-gray-500">
                                            Created:
                                        </span>{" "}
                                        {new Date(
                                            automation.createdAt
                                        ).toLocaleString()}
                                    </div>
                                    {automation.description && (
                                        <div>
                                            <span className="text-gray-500">
                                                Description:
                                            </span>{" "}
                                            {automation.description}
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500">
                                            Target:
                                        </span>{" "}
                                        {automation.target}
                                    </div>
                                </div>

                                <div className="border-t border-gray-700 pt-2 mt-2">
                                    <div className="text-xs text-green-300 mb-1">
                                        Trigger this automation:
                                    </div>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={triggerData}
                                            onChange={(e) =>
                                                setTriggerData(e.target.value)
                                            }
                                            placeholder="Optional data"
                                            className="flex-1 bg-gray-900 border border-gray-700 text-green-300 px-2 py-1 text-xs rounded focus:outline-none focus:border-green-500"
                                        />
                                        <button
                                            onClick={() =>
                                                handleTrigger(
                                                    automation.id,
                                                    automation.when
                                                )
                                            }
                                            className="px-2 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-600"
                                        >
                                            Trigger
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-3">
                                    <button
                                        onClick={() =>
                                            handleDelete(automation.id)
                                        }
                                        className="px-2 py-1 bg-red-700 text-white text-xs rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
}
