import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, Undo2 } from "lucide-react";

const useUndoDelete = () => {
  const pendingDeleteMapRef = useRef(new Map());

  useEffect(() => {
    return () => {
      pendingDeleteMapRef.current.forEach(({ timeoutId }) => {
        clearTimeout(timeoutId);
      });
      pendingDeleteMapRef.current.clear();
    };
  }, []);

  const scheduleUndoDelete = ({
    id,
    item,
    removeOptimistic,
    restoreOptimistic,
    commitDelete,
    successMessage = "Đã xóa thành công",
    errorMessage = "Xóa thất bại",
    pendingMessage = "Đã xóa — Hoàn tác?",
    duration = 5000,
  }) => {
    removeOptimistic();

    const timeoutId = setTimeout(async () => {
      try {
        await commitDelete();
        toast.success(successMessage, {
          icon: <CheckCircle2 size={16} />,
        });
      } catch (error) {
        restoreOptimistic(item);
        toast.error(errorMessage);
      } finally {
        pendingDeleteMapRef.current.delete(id);
      }
    }, duration);

    pendingDeleteMapRef.current.set(id, { timeoutId, item, restoreOptimistic });

    toast(pendingMessage, {
      duration,
      icon: <Undo2 size={16} />,
      action: {
        label: "Undo",
        onClick: () => {
          const pending = pendingDeleteMapRef.current.get(id);
          if (!pending) return;
          clearTimeout(pending.timeoutId);
          pending.restoreOptimistic(pending.item);
          pendingDeleteMapRef.current.delete(id);
          toast.success("Đã hoàn tác", {
            icon: <CheckCircle2 size={16} />,
          });
        },
      },
    });
  };

  return { scheduleUndoDelete };
};

export default useUndoDelete;
