import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import { ArrowLeft, FileText, Save, RotateCcw, ExternalLink, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const LearningPage = () => {
    const { courseSlug, lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentFen, setCurrentFen] = useState('');
    const [moveHistory, setMoveHistory] = useState([]);
    const [savingProgress, setSavingProgress] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(false);
    const [game, setGame] = useState(new Chess());
    const [invalidMoveMessage, setInvalidMoveMessage] = useState("");
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [replayStep, setReplayStep] = useState(0);
    const [nextLesson, setNextLesson] = useState(null);
    const [prevLesson, setPrevLesson] = useState(null);
    const chessViewportRef = useRef(null);

    const swapTurnInFen = (fen) => {
        const parts = String(fen || "").split(" ");
        if (parts.length < 2) return fen;
        parts[1] = parts[1] === "w" ? "b" : "w";
        return parts.join(" ");
    };

    const isLichessLink = (url) => {
        const raw = String(url || "").trim();
        if (!raw) return false;
        try {
            const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
            return /(^|\.)lichess\.org$/i.test(parsed.hostname);
        } catch {
            return false;
        }
    };

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                // If we also want the full course context, we might need to fetch the course too
                // For now, let's just fetch the lesson
                const res = await courseService.getLessonById(lessonId);
                setLesson(res);
            } catch (error) {
                console.error("Failed to fetch lesson", error);
                if (error?.response?.status === 403) {
                    alert(error?.response?.data?.message || "Bạn không có quyền xem bài học này.");
                    navigate(`/courses/${courseSlug}`);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [lessonId]);

    useEffect(() => {
        if (!lessonId) return;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [lessonId]);

    useEffect(() => {
        const resolveNextLesson = async () => {
            if (!lessonId) {
                setNextLesson(null);
                return;
            }
            try {
                const nextData = await courseService.getNextLesson(lessonId);
                const upcoming = nextData?.nextLesson || null;
                setNextLesson(
                    upcoming
                        ? {
                              _id: upcoming._id,
                              title: upcoming.title || "Bài học tiếp theo",
                          }
                        : null,
                );
            } catch {
                setNextLesson(null);
            }
        };
        resolveNextLesson();
    }, [lessonId]);

    useEffect(() => {
        const resolvePrevLesson = async () => {
            if (!lessonId) {
                setPrevLesson(null);
                return;
            }
            try {
                const prevData = await courseService.getPrevLesson(lessonId);
                const previous = prevData?.prevLesson || null;
                setPrevLesson(
                    previous
                        ? {
                              _id: previous._id,
                              title: previous.title || "Bài học trước",
                          }
                        : null,
                );
            } catch {
                setPrevLesson(null);
            }
        };
        resolvePrevLesson();
    }, [lessonId]);

    useEffect(() => {
        const loadChessProgress = async () => {
            if (!lesson || lesson.type !== "chess" || lesson.chessMode !== "internal") return;
            setLoadingProgress(true);
            try {
                let baseGame;
                try {
                    baseGame = lesson.initialFen ? new Chess(lesson.initialFen) : new Chess();
                } catch {
                    baseGame = new Chess();
                }
                const configuredMoves = Array.isArray(lesson?.initialMoves) ? lesson.initialMoves : [];
                if (configuredMoves.length > 0) {
                    // Replay mode: start from initial board, user navigates with arrows.
                    setGame(baseGame);
                    setCurrentFen(baseGame.fen());
                    setMoveHistory(configuredMoves);
                    setReplayStep(0);
                    setSelectedSquare(null);
                    setInvalidMoveMessage("");
                    return;
                }

                setGame(baseGame);
                setCurrentFen(baseGame.fen());
                setMoveHistory(baseGame.history());
                setSelectedSquare(null);

                const progress = await courseService.getMyLessonChessProgress(lesson._id);
                if (progress?.fen) {
                    try {
                        const resumed = new Chess(progress.fen);
                        setGame(resumed);
                        setCurrentFen(resumed.fen());
                        setMoveHistory(Array.isArray(progress?.moves) ? progress.moves : resumed.history());
                        setSelectedSquare(null);
                    } catch {
                        // Keep fallback board.
                    }
                }
            } catch {
                // Skip progress loading errors silently.
            } finally {
                setLoadingProgress(false);
            }
        };
        loadChessProgress();
    }, [lesson]);

    const makeMove = (moveInput) => {
        const tryMove = (fenSource) => {
            const gameCopy = new Chess(fenSource);
            const move = gameCopy.move(moveInput);
            if (!move) return null;
            return { move, gameCopy };
        };

        let result = tryMove(game.fen());
        if (!result) {
            result = tryMove(swapTurnInFen(game.fen()));
        }
        if (!result) return null;

        setGame(result.gameCopy);
        setCurrentFen(result.gameCopy.fen());
        setMoveHistory(result.gameCopy.history());
        return result.move;
    };

    const onDropPiece = ({ sourceSquare, targetSquare }) => {
        setInvalidMoveMessage("");
        if (!sourceSquare || !targetSquare) return false;
        const move = makeMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
        });
        if (!move) {
            setInvalidMoveMessage("Nước đi không hợp lệ hoặc chưa đến lượt quân này.");
            return false;
        }
        setSelectedSquare(null);
        return true;
    };

    const onSquareClick = ({ square }) => {
        if (!square) return;
        if (isReplayMode) return;
        setInvalidMoveMessage("");
        if (!selectedSquare) {
            const pickedPiece = game.get(square);
            if (!pickedPiece) return;
            setSelectedSquare(square);
            return;
        }

        if (selectedSquare === square) {
            setSelectedSquare(null);
            return;
        }

        const move = makeMove({
            from: selectedSquare,
            to: square,
            promotion: "q",
        });
        if (!move) {
            const repickPiece = game.get(square);
            if (repickPiece && repickPiece.color === game.turn()) {
                setSelectedSquare(square);
                return;
            }
            setInvalidMoveMessage("Nước đi không hợp lệ hoặc chưa đến lượt quân này.");
            return;
        }
        setSelectedSquare(null);
    };

    const handleResetBoard = () => {
        let game;
        try {
            game = lesson?.initialFen ? new Chess(lesson.initialFen) : new Chess();
        } catch {
            game = new Chess();
        }
        setGame(game);
        setCurrentFen(game.fen());
        if (isReplayMode) {
            setReplayStep(0);
        } else {
            setMoveHistory(game.history());
        }
        setSelectedSquare(null);
    };

    const handleSaveChessProgress = async () => {
        if (!lesson?._id) return;
        try {
            setSavingProgress(true);
            await courseService.saveMyLessonChessProgress(lesson._id, {
                fen: game.fen(),
                pgn: game.pgn(),
                moves: game.history(),
            });
            alert("Đã lưu nước đi thành công.");
        } catch (error) {
            alert(error?.response?.data?.message || "Không thể lưu nước đi.");
        } finally {
            setSavingProgress(false);
        }
    };

    const isInternalChessLesson = lesson?.type === "chess" && lesson?.chessMode === "internal";
    const isChessLesson = lesson?.type === "chess";
    const replayMoves = Array.isArray(lesson?.initialMoves) ? lesson.initialMoves : [];
    const isReplayMode = isInternalChessLesson && replayMoves.length > 0;

    useEffect(() => {
        if (!isChessLesson) return;
        const id = window.setTimeout(() => {
            chessViewportRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 80);
        return () => window.clearTimeout(id);
    }, [lesson?._id, isChessLesson]);

    const buildReplayGame = (targetStep) => {
        let baseGame;
        try {
            baseGame = lesson?.initialFen ? new Chess(lesson.initialFen) : new Chess();
        } catch {
            baseGame = new Chess();
        }
        const safeStep = Math.max(0, Math.min(targetStep, replayMoves.length));
        for (let i = 0; i < safeStep; i += 1) {
            const san = replayMoves[i];
            if (!san) continue;
            const moved = baseGame.move(san);
            if (!moved) break;
        }
        return { baseGame, safeStep };
    };

    const handleReplayNext = () => {
        const { baseGame, safeStep } = buildReplayGame(replayStep + 1);
        setReplayStep(safeStep);
        setGame(baseGame);
        setCurrentFen(baseGame.fen());
    };

    const handleReplayPrev = () => {
        const { baseGame, safeStep } = buildReplayGame(replayStep - 1);
        setReplayStep(safeStep);
        setGame(baseGame);
        setCurrentFen(baseGame.fen());
    };

    useEffect(() => {
        if (!isReplayMode) return undefined;
        const onKeyDown = (event) => {
            const tag = String(event.target?.tagName || "").toLowerCase();
            const isTypingTarget =
                tag === "input" || tag === "textarea" || tag === "select" || event.target?.isContentEditable;
            if (isTypingTarget) return;

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                handleReplayPrev();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                handleReplayNext();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isReplayMode, replayStep, replayMoves.length, lesson?._id]);

    const chessboardOptions = useMemo(
        () => ({
            id: "lesson-internal-board",
            position: game.fen(),
            onPieceDrop: onDropPiece,
            onSquareClick,
            allowDragging: !isReplayMode || replayMoves.length === 0,
            boardOrientation: "white",
            animationDurationInMs: 180,
            boardStyle: { width: "100%", maxWidth: "520px" },
            squareStyles: selectedSquare
                ? {
                      [selectedSquare]: {
                          boxShadow: "inset 0 0 0 3px rgba(250, 204, 21, 0.9)",
                      },
                  }
                : {},
        }),
        [game, selectedSquare, isReplayMode, replayMoves.length],
    );

    const videoEmbedUrl = useMemo(() => {
        if (!lesson?.content) return "";
        if (lesson.content.includes('watch?v=')) return lesson.content.replace('watch?v=', 'embed/');
        if (lesson.content.includes('youtu.be/')) return lesson.content.replace('youtu.be/', 'youtube.com/embed/');
        return lesson.content;
    }, [lesson?.content]);

    if (loading) return <div className="text-center py-20 text-white bg-gray-900 min-h-screen">Đang tải bài học...</div>;
    if (!lesson) return <div className="text-center py-20 text-white bg-gray-900 min-h-screen">Không tìm thấy bài học.</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="flex items-center px-6 py-4 border-b border-gray-800 bg-gray-900">
                <button 
                    onClick={() => navigate(`/courses/${courseSlug}`)}
                    className="flex items-center text-gray-400 hover:text-white transition-colors mr-6"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Quay lại khóa học
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold truncate">{lesson.title}</h1>
                </div>
            </header>

            {/* Main Content Area */}
            <div className={`flex-1 ${isChessLesson ? "overflow-hidden p-4 md:p-5" : "overflow-auto p-8"} flex justify-center`}>
                <div className={`w-full ${isChessLesson ? "max-w-6xl h-full flex flex-col min-h-0" : "max-w-4xl"}`}>
                    <div
                        ref={isChessLesson ? chessViewportRef : null}
                        className={`bg-black rounded-xl overflow-hidden shadow-2xl relative ${
                            lesson.type === "chess" ? "flex-1 min-h-0 mb-4" : "aspect-video mb-8"
                        }`}
                    >
                        {lesson.type === 'video' && lesson.content ? (
                            lesson.content.includes('youtube') || lesson.content.includes('youtu.be') ? (
                                <iframe 
                                    src={videoEmbedUrl} 
                                    className="w-full h-full" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video controls className="w-full h-full">
                                    <source src={lesson.content} type="video/mp4" />
                                    Trình duyệt của bạn không hỗ trợ video tag.
                                </video>
                            )
                        ) : lesson.type === 'chess' ? (
                            (lesson.chessMode === "external" || isLichessLink(lesson.content)) ? (
                                lesson.content ? (
                                    <iframe
                                        src={lesson.content}
                                        className="w-full h-full bg-white"
                                        frameBorder="0"
                                        allowFullScreen
                                        title="External chess platform"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-300 gap-3">
                                        <SwordsIcon />
                                        <p>Bài học bàn cờ ngoài chưa có liên kết.</p>
                                    </div>
                                )
                            ) : (
                                <div className="w-full h-full bg-slate-900 p-4 md:p-6 flex flex-col">
                                    <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                                        <div className="text-sm text-gray-300">
                                            {loadingProgress ? "Đang tải bàn cờ..." : `${replayMoves.length || moveHistory.length} nước đi`}
                                        </div>
                                        {!loadingProgress && (
                                            <div className="text-xs text-amber-300">
                                                Đến lượt: {game.turn() === "w" ? "Quân trắng" : "Quân đen"}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {isReplayMode && (
                                                <>
                                                    <button
                                                        onClick={handleReplayPrev}
                                                        disabled={replayStep === 0}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm disabled:opacity-50"
                                                    >
                                                        <ChevronLeft size={14} />
                                                        Lùi
                                                    </button>
                                                    <div className="text-xs text-slate-300 px-1">
                                                        {replayStep}/{replayMoves.length}
                                                    </div>
                                                    <button
                                                        onClick={handleReplayNext}
                                                        disabled={replayStep >= replayMoves.length}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm disabled:opacity-50"
                                                    >
                                                        Tiến
                                                        <ChevronRight size={14} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={handleResetBoard}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
                                            >
                                                <RotateCcw size={14} />
                                                Reset
                                            </button>
                                            {!isReplayMode && (
                                                <button
                                                    onClick={handleSaveChessProgress}
                                                    disabled={savingProgress}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm disabled:opacity-70"
                                                >
                                                    <Save size={14} />
                                                    {savingProgress ? "Đang lưu..." : "Lưu nước đi"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
                                        <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-lg p-2">
                                            <div
                                                className="w-full"
                                                style={{ maxWidth: "min(56vh, 520px)" }}
                                            >
                                                <Chessboard options={chessboardOptions} />
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 rounded-lg p-3 overflow-y-auto">
                                            {invalidMoveMessage ? (
                                                <div className="mb-2 text-xs text-rose-300">{invalidMoveMessage}</div>
                                            ) : null}
                                            <div className="text-sm font-semibold mb-2">Lịch sử nước đi</div>
                                            {(isReplayMode ? replayMoves.length : moveHistory.length) === 0 ? (
                                                <div className="text-sm text-gray-400">
                                                    Bài học chưa được thiết lập nước đi để tua.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {(isReplayMode ? replayMoves : moveHistory).map((move, idx) => (
                                                        <div
                                                            key={`${move}-${idx}`}
                                                            className={`px-2 py-1 rounded ${isReplayMode && idx === replayStep - 1 ? "bg-primary/80 text-white" : "bg-slate-800"}`}
                                                        >
                                                            {idx + 1}. {move}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
                                <FileText size={64} className="mb-4 opacity-50" />
                                <p>Bài học này là dạng văn bản hoặc không có video.</p>
                            </div>
                        )}
                    </div>

                    {(!isChessLesson || lesson.description || (lesson.chessMode === "external" || isLichessLink(lesson.content))) && (
                    <div className="prose prose-invert max-w-none">
                        <h2 className="text-2xl font-bold mb-4">Nội dung bài học</h2>
                        {lesson.type !== 'video' && lesson.type !== 'chess' && (
                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                        )}
                        {lesson.type === "chess" && (lesson.chessMode === "external" || isLichessLink(lesson.content)) && lesson.content && (
                            <a
                                href={lesson.content}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200"
                            >
                                <ExternalLink size={16} />
                                Mở trực tiếp nền tảng chess
                            </a>
                        )}
                        {lesson.description && <p>{lesson.description}</p>}
                    </div>
                    )}

                    <div className={`${isChessLesson ? "mt-3" : "mt-8"} flex justify-between`}>
                        {prevLesson ? (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(`/learning/${courseSlug}/${prevLesson._id}`)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                                title={`Về ${prevLesson.title}`}
                            >
                                <ArrowLeft size={16} />
                                Bài học trước
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 cursor-not-allowed"
                            >
                                Đã là bài đầu
                            </button>
                        )}

                        {nextLesson ? (
                          <button
                              type="button"
                              onClick={() =>
                                  navigate(`/learning/${courseSlug}/${nextLesson._id}`)
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                              title={`Sang ${nextLesson.title}`}
                          >
                              Bài học tiếp theo
                              <ArrowRight size={16} />
                          </button>
                        ) : (
                          <button
                              type="button"
                              disabled
                              className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 cursor-not-allowed"
                          >
                              Đã là bài cuối
                          </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SwordsIcon = () => (
    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl">
        ♞
    </div>
);

export default LearningPage;
