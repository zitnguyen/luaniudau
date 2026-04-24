import React, { useMemo, useState } from 'react';
import axiosClient from '../../../../api/axiosClient';
import { Plus, Video, FileText, Trash2, Swords, RotateCcw, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const LessonManager = ({ chapterId, courseId, lessons, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'video',
        content: '', // URL or text
        chessMode: 'internal',
        chessPlatform: 'internal-board',
        initialFen: '',
        initialPgn: '',
        initialMoves: [],
        duration: 0,
        isFree: false
    });
    const [adminChessGame, setAdminChessGame] = useState(new Chess());
    const [fenInput, setFenInput] = useState("");
    const [selectedAdminSquare, setSelectedAdminSquare] = useState(null);
    const [replayStep, setReplayStep] = useState(0);
    const [configuredMoves, setConfiguredMoves] = useState([]);
    const swapTurnInFen = (fen) => {
        const parts = String(fen || "").split(" ");
        if (parts.length < 2) return fen;
        parts[1] = parts[1] === "w" ? "b" : "w";
        return parts.join(" ");
    };

    const cloneGameWithHistory = (sourceGame) => {
        const pgn = sourceGame?.pgn?.() || "";
        if (pgn) {
            const clone = new Chess();
            try {
                clone.loadPgn(pgn);
                return clone;
            } catch {
                // Fallback to FEN clone below.
            }
        }
        return new Chess(sourceGame?.fen?.() || undefined);
    };

    const rebuildGameFromMoves = (moves) => {
        const rebuilt = new Chess();
        (Array.isArray(moves) ? moves : []).forEach((san) => {
            try {
                rebuilt.move(san);
            } catch {
                // Skip invalid SAN when rebuilding.
            }
        });
        return rebuilt;
    };

    const syncBoardFromMoves = (nextMoves) => {
        const normalizedMoves = Array.isArray(nextMoves) ? nextMoves.filter(Boolean) : [];
        const rebuiltGame = rebuildGameFromMoves(normalizedMoves);
        setConfiguredMoves(normalizedMoves);
        setAdminChessGame(rebuiltGame);
        setFenInput(rebuiltGame.fen());
        setFormData((prev) => ({
            ...prev,
            initialFen: rebuiltGame.fen(),
            initialPgn: rebuiltGame.pgn(),
            initialMoves: normalizedMoves,
        }));
        setReplayStep(normalizedMoves.length);
        setSelectedAdminSquare(null);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            const canonicalMoves = Array.isArray(configuredMoves) ? configuredMoves : [];
            const canonicalGame =
                canonicalMoves.length > 0 ? rebuildGameFromMoves(canonicalMoves) : adminChessGame;
            const canonicalFen = String(formData.initialFen || canonicalGame.fen() || "").trim();
            const canonicalPgn = String(formData.initialPgn || canonicalGame.pgn() || "").trim();
            const payload =
                formData.type === "chess"
                    ? {
                          ...formData,
                          content: "",
                          chessMode: "internal",
                          chessPlatform: "internal-board",
                          initialFen: canonicalFen,
                          initialPgn: canonicalPgn,
                          initialMoves: canonicalMoves,
                      }
                    : { ...formData };
            if (editingLessonId) {
                await axiosClient.put(`/lessons/${editingLessonId}`, payload);
            } else {
                await axiosClient.post('/lessons', {
                    ...payload,
                    chapterId,
                    courseId,
                    order: lessons.length + 1
                });
            }
            setIsAdding(false);
            setEditingLessonId(null);
            setFormData({
                title: '',
                type: 'video',
                content: '',
                chessMode: 'internal',
                chessPlatform: 'internal-board',
                initialFen: '',
                initialPgn: '',
                initialMoves: [],
                duration: 0,
                isFree: false,
            });
            setAdminChessGame(new Chess());
            setFenInput("");
            setReplayStep(0);
            setConfiguredMoves([]);
            onUpdate();
        } catch (error) {
            console.error("Error adding lesson:", error);
            const detail =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Lỗi thêm bài học";
            alert(detail);
        }
    };

    const handleEditLesson = (lesson) => {
        setIsAdding(true);
        setEditingLessonId(lesson?._id || null);
        const nextFormData = {
            title: lesson?.title || "",
            type: lesson?.type || "video",
            content: lesson?.content || "",
            chessMode: lesson?.chessMode || "internal",
            chessPlatform: lesson?.chessPlatform || "internal-board",
            initialFen: lesson?.initialFen || "",
            initialPgn: lesson?.initialPgn || "",
            initialMoves: Array.isArray(lesson?.initialMoves) ? lesson.initialMoves : [],
            duration: Number(lesson?.duration || 0),
            isFree: Boolean(lesson?.isFree),
        };
        setFormData(nextFormData);

        if (nextFormData.type === "chess") {
            let nextGame = new Chess();
            if (nextFormData.initialPgn) {
                try {
                    nextGame.loadPgn(nextFormData.initialPgn);
                } catch {
                    // fallback to FEN below
                }
            } else if (nextFormData.initialFen) {
                try {
                    nextGame = new Chess(nextFormData.initialFen);
                } catch {
                    nextGame = new Chess();
                }
            }
            if (nextGame.history().length === 0 && nextFormData.initialMoves.length > 0) {
                const replayGame = new Chess();
                nextFormData.initialMoves.forEach((san) => {
                    try {
                        replayGame.move(san);
                    } catch {
                        // ignore invalid move during hydration
                    }
                });
                nextGame = replayGame;
            }
            setAdminChessGame(nextGame);
            setFenInput(nextGame.fen());
            const loadedMoves =
                Array.isArray(nextFormData.initialMoves) && nextFormData.initialMoves.length > 0
                    ? nextFormData.initialMoves
                    : nextGame.history();
            setConfiguredMoves(loadedMoves);
            setReplayStep(loadedMoves.length || 0);
            setSelectedAdminSquare(null);
        } else {
            setAdminChessGame(new Chess());
            setFenInput("");
            setReplayStep(0);
            setConfiguredMoves([]);
            setSelectedAdminSquare(null);
        }
    };

    const handleDelete = async (lessonId) => {
        if (!window.confirm("Xóa bài học này?")) return;
        try {
            await axiosClient.delete(`/lessons/${lessonId}`);
            onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdminBoardDrop = ({ sourceSquare, targetSquare }) => {
        if (!sourceSquare || !targetSquare) return false;
        const tryMove = (gameSource, useFenSwap = false) => {
            const copy = useFenSwap
                ? new Chess(swapTurnInFen(gameSource.fen()))
                : cloneGameWithHistory(gameSource);
            const move = copy.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
            if (!move) return null;
            return { move, copy };
        };
        let result = tryMove(adminChessGame, false);
        if (!result) {
            result = tryMove(adminChessGame, true);
        }
        if (!result) return false;

        const nextSan = result?.move?.san;
        if (!nextSan) return false;
        const baseMoves = configuredMoves.slice(0, replayStep);
        syncBoardFromMoves([...baseMoves, nextSan]);
        return true;
    };

    const handleAdminSquareClick = ({ square }) => {
        if (!square) return;
        if (!selectedAdminSquare) {
            const pickedPiece = adminChessGame.get(square);
            if (!pickedPiece) return;
            setSelectedAdminSquare(square);
            return;
        }

        if (selectedAdminSquare === square) {
            setSelectedAdminSquare(null);
            return;
        }

        const tryMove = (fenSource) => {
            const copy = cloneGameWithHistory(fenSource);
            const move = copy.move({ from: selectedAdminSquare, to: square, promotion: "q" });
            if (!move) return null;
            return { move, copy };
        };
        let result = tryMove(adminChessGame);
        if (!result) {
            const swapped = new Chess(swapTurnInFen(adminChessGame.fen()));
            const move = swapped.move({ from: selectedAdminSquare, to: square, promotion: "q" });
            result = move ? { move, copy: swapped } : null;
        }
        if (!result) {
            const repick = adminChessGame.get(square);
            if (repick) {
                setSelectedAdminSquare(square);
            }
            return;
        }
        const nextSan = result?.move?.san;
        if (!nextSan) return;
        const baseMoves = configuredMoves.slice(0, replayStep);
        syncBoardFromMoves([...baseMoves, nextSan]);
    };

    const handleApplyFen = () => {
        try {
            const next = new Chess(fenInput || undefined);
            setAdminChessGame(next);
            setConfiguredMoves(next.history());
            setFormData((prev) => ({
                ...prev,
                initialFen: next.fen(),
                initialPgn: next.pgn(),
                initialMoves: next.history(),
            }));
            setReplayStep(next.history().length);
        } catch {
            alert("FEN không hợp lệ.");
        }
    };

    const handleResetAdminBoard = () => {
        const next = new Chess();
        setAdminChessGame(next);
        setFenInput(next.fen());
        setConfiguredMoves([]);
        setFormData((prev) => ({
            ...prev,
            initialFen: next.fen(),
            initialPgn: next.pgn(),
            initialMoves: next.history(),
        }));
        setReplayStep(0);
        setSelectedAdminSquare(null);
    };

    const adminBoardOptions = useMemo(
        () => ({
            id: `admin-lesson-board-${chapterId}`,
            position: adminChessGame.fen(),
            onPieceDrop: handleAdminBoardDrop,
            onSquareClick: handleAdminSquareClick,
            allowDragging: true,
            boardStyle: { width: "340px", maxWidth: "100%" },
            squareStyles: selectedAdminSquare
                ? {
                      [selectedAdminSquare]: {
                          boxShadow: "inset 0 0 0 3px rgba(250, 204, 21, 0.9)",
                      },
                  }
                : {},
        }),
        [adminChessGame, selectedAdminSquare, chapterId],
    );

    const savedMoveHistory = configuredMoves;
    const adminMoveHistory = savedMoveHistory;

    const buildReplayGameByStep = (targetStep) => {
        const safeStep = Math.max(0, Math.min(targetStep, savedMoveHistory.length));
        const replayGame = rebuildGameFromMoves(savedMoveHistory.slice(0, safeStep));
        setReplayStep(safeStep);
        setAdminChessGame(replayGame);
        setFenInput(replayGame.fen());
        setSelectedAdminSquare(null);
    };

    const handleReplayPrev = () => buildReplayGameByStep(replayStep - 1);
    const handleReplayNext = () => buildReplayGameByStep(replayStep + 1);

    return (
        <div className="space-y-3 pl-4 border-l-2 border-gray-100 ml-2">
            {lessons.map((lesson) => (
                <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group transition-colors">
                    <div className="flex items-center gap-3">
                        {lesson.type === 'video' ? <Video className="w-4 h-4 text-blue-500" /> : lesson.type === 'chess' ? <Swords className="w-4 h-4 text-amber-500" /> : <FileText className="w-4 h-4 text-green-500" />}
                        <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
                        {lesson.isFree && <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Học thử</span>}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-xs text-gray-400 mr-2">{lesson.duration}p</span>
                         <button onClick={() => handleEditLesson(lesson)} className="text-gray-400 hover:text-blue-600">
                             <Pencil className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(lesson._id)} className="text-gray-400 hover:text-red-600">
                             <Trash2 className="w-4 h-4" />
                         </button>
                    </div>
                </div>
            ))}

            {isAdding ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-blue-100 mt-2">
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            className="w-full p-2 text-sm border rounded focus:border-primary focus:outline-none"
                            placeholder="Tên bài học..."
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                        <div className="flex gap-2">
                             <select 
                                className="p-2 text-sm border rounded"
                                value={formData.type}
                                onChange={e => {
                                    const nextType = e.target.value;
                                    setFormData({...formData, type: nextType});
                                    if (nextType === "chess") {
                                        const next = new Chess();
                                        setAdminChessGame(next);
                                        setFenInput(next.fen());
                                        setConfiguredMoves([]);
                                        setFormData((prev) => ({
                                            ...prev,
                                            initialFen: next.fen(),
                                            initialPgn: next.pgn(),
                                            initialMoves: next.history(),
                                        }));
                                        setReplayStep(0);
                                    }
                                }}
                             >
                                 <option value="video">Video</option>
                                 <option value="text">Bài đọc</option>
                                 <option value="chess">Bàn cờ</option>
                             </select>
                             {formData.type !== "chess" ? (
                                <input 
                                    type="text" 
                                    className="flex-1 p-2 text-sm border rounded"
                                    placeholder={
                                      formData.type === 'video'
                                        ? "URL Video (Youtube/Vimeo)..."
                                        : "Nội dung bài học..."
                                    }
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                />
                             ) : (
                                <div className="flex-1 p-2 text-sm border rounded bg-gray-100 text-gray-600">
                                    Bài cờ nội bộ: thao tác trực tiếp trên bàn cờ bên dưới.
                                </div>
                             )}
                        </div>
                        {formData.type === "chess" && (
                          <div className="space-y-2 border border-amber-200 bg-amber-50 rounded-lg p-3">
                            <div className="text-xs text-amber-700">
                                Bàn cờ nội bộ: admin đi quân hoặc nhập FEN, trạng thái sẽ lưu vào bài học.
                            </div>
                            <div className="text-xs text-slate-600">
                                Đã thiết lập: <span className="font-semibold">{adminMoveHistory.length}</span> nước đi
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleReplayPrev}
                                    disabled={replayStep === 0}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-700 text-white disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    Lùi
                                </button>
                                <div className="text-xs text-slate-700 font-medium">
                                    {replayStep}/{savedMoveHistory.length}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleReplayNext}
                                    disabled={replayStep >= savedMoveHistory.length}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-700 text-white disabled:opacity-50"
                                >
                                    Tiến
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="max-w-[360px]">
                                <Chessboard
                                    options={adminBoardOptions}
                                />
                            </div>
                            <div className="flex flex-col md:flex-row gap-2">
                                <input
                                    type="text"
                                    className="flex-1 p-2 text-xs border rounded"
                                    placeholder="Nhập FEN (tuỳ chọn)"
                                    value={fenInput}
                                    onChange={(e) => setFenInput(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyFen}
                                    className="px-3 py-1.5 text-xs bg-slate-700 text-white rounded"
                                >
                                    Áp dụng FEN
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetAdminBoard}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Reset
                                </button>
                            </div>
                            {adminMoveHistory.length > 0 && (
                                <div className="max-h-28 overflow-y-auto rounded border border-amber-100 bg-white px-2 py-1 text-xs text-slate-700">
                                    {adminMoveHistory.map((move, idx) => (
                                        <span key={`${move}-${idx}`} className="mr-2 inline-block">
                                            {idx + 1}.{move}
                                        </span>
                                    ))}
                                </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                            <input 
                                type="number" 
                                className="w-24 p-2 text-sm border rounded"
                                placeholder="Phút"
                                value={formData.duration}
                                onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                            />
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isFree}
                                    onChange={e => setFormData({...formData, isFree: e.target.checked})}
                                />
                                Cho phép học thử
                            </label>
                            <div className="flex-1 flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditingLessonId(null);
                                    }}
                                    className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-200 rounded"
                                >
                                    Hủy
                                </button>
                                <button type="button" onClick={handleSubmit} className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90">
                                    {editingLessonId ? "Cập Nhật Bài Học" : "Lưu Bài Học"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-sm text-primary font-medium hover:underline mt-2 px-2"
                >
                    <Plus className="w-4 h-4" />
                    Thêm bài học
                </button>
            )}
        </div>
    );
};

export default LessonManager;
