import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import reviewService from '../../services/reviewService';
import orderService from '../../services/orderService';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { usePublicCms } from '../../context/PublicCmsContext';
// import orderService from '../../services/orderService';
import { PlayCircle, Clock, FileText, User, X, Copy, Loader2 } from 'lucide-react';

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [curriculum, setCurriculum] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [canViewContent, setCanViewContent] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [editingReviewId, setEditingReviewId] = useState("");
    const [editingReviewForm, setEditingReviewForm] = useState({ rating: 5, comment: "" });
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    })();
    const currentRole = String(user?.role || "").toLowerCase();
    const isAdmin = currentRole === "admin";
    const canSubmitReview = Boolean(user && canViewContent);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [confirmingTransfer, setConfirmingTransfer] = useState(false);
    const [pendingOrder, setPendingOrder] = useState(null);
    const { settings } = useSystemSettings();
    const { cms } = usePublicCms();
    const detailTheme = cms?.courseDetail || {};
    const globalTheme = cms?.theme || {};

    const paymentInfo = {
        bankName: settings?.bankName || "Techcombank",
        accountNumber: settings?.bankAccountNumber || "ĐANG CẬP NHẬT",
        accountName: settings?.bankAccountName || "ĐANG CẬP NHẬT",
        qrUrl: settings?.paymentQrUrl || "",
        transferContent: `${user?.fullName || user?.username || "HocVien"}_khoahoc`,
    };

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await courseService.getCourseBySlug(slug);
                setCourse(res.course);
                setCurriculum(res.curriculum);
                setCanViewContent(Boolean(res.canViewContent));
                if (res.course?._id) {
                    const reviewData = await reviewService.getByCourseId(res.course._id);
                    setReviews(Array.isArray(reviewData) ? reviewData : []);
                }
            } catch (error) {
                console.error("Failed to fetch course", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [slug]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/courses/${slug}` } });
            return;
        }
        if (canViewContent) {
            const firstLessonId = curriculum?.[0]?.lessons?.[0]?._id;
            if (firstLessonId) {
                navigate(`/learning/${slug}/${firstLessonId}`);
                return;
            }
            alert("Khóa học chưa có bài học để mở.");
            return;
        }
        setShowPaymentModal(true);
    };

    const copyText = async (text) => {
        try {
            await navigator.clipboard.writeText(text || "");
            alert("Đã sao chép.");
        } catch {
            alert("Không thể sao chép.");
        }
    };

    const handleTransferred = async () => {
        if (!course?._id) return;
        try {
            setConfirmingTransfer(true);
            const order = await orderService.create({
                items: [{ courseId: course._id }],
                paymentMethod: "bank_transfer",
            });
            setPendingOrder(order);
            setShowPaymentModal(false);
        } catch (error) {
            alert(error?.response?.data?.message || "Không thể ghi nhận xác nhận chuyển khoản.");
        } finally {
            setConfirmingTransfer(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login', { state: { from: `/courses/${slug}` } });
            return;
        }
        if (!course?._id) return;
        if (!canSubmitReview) {
            alert("Bạn chưa có quyền xem nội dung khóa học nên chưa thể đánh giá.");
            return;
        }

        try {
            setSubmittingReview(true);
            await reviewService.create({
                courseId: course._id,
                rating: Number(reviewForm.rating),
                comment: reviewForm.comment,
            });
            const reviewData = await reviewService.getByCourseId(course._id);
            setReviews(Array.isArray(reviewData) ? reviewData : []);
            setReviewForm({ rating: 5, comment: "" });
        } catch (error) {
            alert(error?.response?.data?.message || "Không thể gửi đánh giá");
        } finally {
            setSubmittingReview(false);
        }
    };

    const startEditReview = (review) => {
        setEditingReviewId(String(review._id));
        setEditingReviewForm({
            rating: Number(review.rating) || 5,
            comment: review.comment || "",
        });
    };

    const cancelEditReview = () => {
        setEditingReviewId("");
        setEditingReviewForm({ rating: 5, comment: "" });
    };

    const handleUpdateReview = async (reviewId) => {
        if (!isAdmin) return;
        try {
            await reviewService.update(reviewId, {
                rating: Number(editingReviewForm.rating),
                comment: editingReviewForm.comment,
            });
            if (course?._id) {
                const reviewData = await reviewService.getByCourseId(course._id);
                setReviews(Array.isArray(reviewData) ? reviewData : []);
            }
            cancelEditReview();
        } catch (error) {
            alert(error?.response?.data?.message || "Không thể cập nhật đánh giá");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!isAdmin) return;
        const ok = window.confirm("Xóa đánh giá này?");
        if (!ok) return;
        try {
            await reviewService.remove(reviewId);
            setReviews((prev) => prev.filter((item) => String(item._id) !== String(reviewId)));
            if (editingReviewId === String(reviewId)) cancelEditReview();
        } catch (error) {
            alert(error?.response?.data?.message || "Không thể xóa đánh giá");
        }
    };

    if (loading) return <div className="text-center py-20">Đang tải...</div>;
    if (!course) return <div className="text-center py-20">Không tìm thấy khóa học.</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-5 py-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Thông tin chuyển khoản</h3>
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="text-sm text-gray-600">
                                Vui lòng chuyển khoản đúng nội dung để hệ thống xác nhận khóa học nhanh hơn.
                            </div>
                            <div className="rounded-xl border p-4 space-y-3">
                                <div><span className="font-semibold">Ngân hàng:</span> {paymentInfo.bankName}</div>
                                <div className="flex items-center justify-between gap-2">
                                    <div><span className="font-semibold">STK:</span> {paymentInfo.accountNumber}</div>
                                    <button type="button" onClick={() => copyText(paymentInfo.accountNumber)} className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded border hover:bg-gray-50"><Copy size={14} /> Sao chép</button>
                                </div>
                                <div><span className="font-semibold">Chủ tài khoản:</span> {paymentInfo.accountName}</div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="break-all"><span className="font-semibold">Nội dung chuyển khoản:</span> {paymentInfo.transferContent}</div>
                                    <button type="button" onClick={() => copyText(paymentInfo.transferContent)} className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded border hover:bg-gray-50"><Copy size={14} /> Sao chép</button>
                                </div>
                            </div>
                            <div className="rounded-xl border p-4">
                                <div className="font-semibold mb-2">QR chuyển khoản</div>
                                {paymentInfo.qrUrl ? (
                                    <img src={paymentInfo.qrUrl} alt="QR chuyển khoản" className="w-52 h-52 object-contain border rounded-lg" />
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        Chưa cấu hình ảnh QR. Vui lòng liên hệ Admin để nhận QR.
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleTransferred}
                                disabled={confirmingTransfer}
                                className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-70 inline-flex items-center justify-center gap-2"
                            >
                                {confirmingTransfer ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Đang xác nhận...
                                    </>
                                ) : (
                                    "Đã chuyển khoản"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {pendingOrder && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-5 py-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Đang chờ Admin duyệt</h3>
                            <button
                                type="button"
                                onClick={() => setPendingOrder(null)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-3 text-sm text-gray-700">
                            <p>Hệ thống đã ghi nhận bạn xác nhận chuyển khoản thành công.</p>
                            <p>Đơn mua khóa học đang ở trạng thái <span className="font-semibold">chờ Admin duyệt</span>.</p>
                            <p>Mã đơn: <span className="font-mono">{pendingOrder?._id}</span></p>
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setPendingOrder(null)}
                                    className="px-4 py-2 rounded-lg bg-primary text-white"
                                    style={{
                                        backgroundColor: detailTheme?.primaryButtonColor || undefined,
                                        color: detailTheme?.primaryButtonTextColor || undefined,
                                        borderRadius: globalTheme?.buttonRadius || undefined,
                                    }}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Hero Section */}
            <div
                className="text-white py-12 md:py-20 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: course?.heroBackground
                        ? `linear-gradient(${detailTheme?.overlayColor || "rgba(15, 23, 42, 0.78)"}, ${detailTheme?.overlayColor || "rgba(15, 23, 42, 0.78)"}), url(${course.heroBackground})`
                        : undefined,
                    backgroundColor: course?.heroBackground ? undefined : "#111827",
                }}
            >
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="text-yellow-400 font-bold mb-4 uppercase tracking-wider text-sm">
                            {course.category} &bull; {course.level}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight font-heading">
                            {course.title}
                        </h1>
                        <p className="text-lg opacity-80 mb-8 leading-relaxed">
                            {course.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm opacity-90 mb-8">
                            <div className="flex items-center gap-2">
                                <User size={18} />
                                <span>{course.instructor?.fullName || 'Daisy Team'}</span>
                            </div>
                            {/* <div className="flex items-center gap-2">
                                <Star size={18} className="text-yellow-400 fill-current" />
                                <span>4.9 (120 đánh giá)</span>
                            </div> */}
                            <div className="flex items-center gap-2">
                                <Clock size={18} />
                                <span>{course.totalDuration || 0} phút</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Course Preview / Purchase Card (In Hero for Desktop) */}
                    <div className="hidden md:block relative">
                         <div className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden max-w-sm ml-auto">
                            <div className="relative h-48 bg-gray-200">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                                        <PlayCircle size={64} className="opacity-50" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="text-3xl font-bold mb-6 text-center text-blue-900">
                                    {course.price === 0 ? "Miễn phí" : `${course.price?.toLocaleString()}đ`}
                                    {course.salePrice > 0 && (
                                        <span className="text-lg text-gray-400 line-through ml-3 font-normal">
                                            {course.salePrice.toLocaleString()}đ
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={handleEnroll}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mb-4 text-lg"
                                    style={{
                                        backgroundColor: detailTheme?.primaryButtonColor || undefined,
                                        color: detailTheme?.primaryButtonTextColor || undefined,
                                        borderRadius: globalTheme?.buttonRadius || undefined,
                                    }}
                                >
                                    {canViewContent ? "Mở khóa học" : "Mua khóa học"}
                                </button>
                                <div className="text-sm text-gray-500 text-center">
                                    Truy cập trọn đời &bull; Hoàn tiền trong 7 ngày
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Mobile Purchase Button (Sticky Bottom) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex items-center justify-between">
                <div>
                     <span className="block text-sm text-gray-500">Giá khóa học:</span>
                     <span className="text-xl font-bold text-blue-900">
                        {course.price === 0 ? "Miễn phí" : `${course.price?.toLocaleString()}đ`}
                     </span>
                </div>
                <button 
                    onClick={handleEnroll}
                    className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
                    style={{
                        backgroundColor: detailTheme?.primaryButtonColor || undefined,
                        color: detailTheme?.primaryButtonTextColor || undefined,
                        borderRadius: globalTheme?.buttonRadius || undefined,
                    }}
                >
                    {canViewContent ? "Mở khóa học" : "Mua khóa học"}
                </button>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2">
                    {/* Curriculum */}
                    <h2 className="text-2xl font-bold mb-6 font-heading text-gray-900">Nội dung khóa học</h2>
                    {!canViewContent && (
                        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Bạn chưa được Admin cấp quyền xem nội dung từng bài học của khóa này.
                        </div>
                    )}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {curriculum.length > 0 ? curriculum.map((chapter, index) => (
                            <div key={chapter._id} className="border-b border-gray-100 last:border-0">
                                <div className="bg-gray-50 px-6 py-4 font-semibold text-gray-800 flex justify-between items-center">
                                    <span>Chương {index + 1}: {chapter.title}</span>
                                    <span className="text-sm text-gray-500">
                                        {canViewContent ? (chapter.lessons?.length || 0) : (chapter.lessonCount || 0)} bài học
                                    </span>
                                </div>
                                {canViewContent ? (
                                    <div>
                                        {chapter.lessons?.map((lesson) => (
                                            <div 
                                                key={lesson._id} 
                                                onClick={() => navigate(`/learning/${slug}/${lesson._id}`)}
                                                className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                                            >
                                                {lesson.type === 'video' ? (
                                                    <PlayCircle size={16} className="text-gray-400 group-hover:text-blue-500" />
                                                ) : (
                                                    <FileText size={16} className="text-gray-400 group-hover:text-blue-500" />
                                                )}
                                                <div className="flex-1">
                                                    <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                                                        {lesson.title}
                                                    </span>
                                                    {lesson.isFree && (
                                                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Học thử</span>
                                                    )}
                                                </div>
                                                {lesson.duration > 0 && (
                                                    <span className="text-xs text-gray-400">{lesson.duration}p</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-6 py-3 text-sm text-gray-500">
                                        Vui lòng đăng nhập đúng quyền để xem danh sách bài học.
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="p-6 text-gray-500 text-center">Nội dung đang được cập nhật...</div>
                        )}
                    </div>

                    {/* Instructor */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6 font-heading text-gray-900">Giảng viên</h2>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start gap-6">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                                <User size={32} className="text-gray-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{course.instructor?.fullName || 'Daisy Team'}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Đội ngũ giảng viên, kiện tướng giàu kinh nghiệm tại Daisy Chess.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6 font-heading text-gray-900">Đánh giá của học viên</h2>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                            {canSubmitReview ? (
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <select
                                            value={reviewForm.rating}
                                            onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: e.target.value }))}
                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                        >
                                            <option value={5}>5 sao</option>
                                            <option value={4}>4 sao</option>
                                            <option value={3}>3 sao</option>
                                            <option value={2}>2 sao</option>
                                            <option value={1}>1 sao</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Nhận xét của bạn..."
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                            className="md:col-span-3 border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
                                    >
                                        {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                                    Chỉ học viên/phụ huynh đã được cấp quyền xem nội dung khóa học mới có thể gửi đánh giá.
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {reviews.length === 0 ? (
                                <div className="text-gray-500 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    Chưa có đánh giá nào cho khóa học này.
                                </div>
                            ) : (
                                reviews.map((r) => (
                                    <div key={r._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-gray-900">{r.userId?.fullName || "Học viên"}</div>
                                            <div className="text-yellow-500 font-semibold">{'★'.repeat(r.rating)}</div>
                                        </div>
                                        {editingReviewId === String(r._id) ? (
                                            <div className="space-y-3">
                                                <select
                                                    value={editingReviewForm.rating}
                                                    onChange={(e) => setEditingReviewForm((prev) => ({ ...prev, rating: e.target.value }))}
                                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                                >
                                                    <option value={5}>5 sao</option>
                                                    <option value={4}>4 sao</option>
                                                    <option value={3}>3 sao</option>
                                                    <option value={2}>2 sao</option>
                                                    <option value={1}>1 sao</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={editingReviewForm.comment}
                                                    onChange={(e) => setEditingReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                    placeholder="Nhận xét..."
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateReview(r._id)}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                                                    >
                                                        Lưu
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEditReview}
                                                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-700">{r.comment || "Không có nhận xét."}</div>
                                        )}
                                        {isAdmin && editingReviewId !== String(r._id) && (
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditReview(r)}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteReview(r._id)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
