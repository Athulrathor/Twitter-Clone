import React, { useState } from "react";

const ChangePasswordDialog = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const error = {};

    if (!currentPassword.trim()) {
      error.currentPassword = "Current password is required";
    }

    if (!newPassword.trim()) {
      error.newPassword = "New password is required";
    } else {
      if (newPassword.length < 8) {
        error.newPassword = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(newPassword)) {
        error.newPassword = "Include one uppercase letter";
      } else if (!/[a-z]/.test(newPassword)) {
        error.newPassword = "Include one lowercase letter";
      } else if (!/[0-9]/.test(newPassword)) {
        error.newPassword = "Include one number";
      } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
        error.newPassword = "Include one special character";
      }
    }

    if (confirmPassword !== newPassword) {
      error.confirmPassword = "Passwords do not match";
    }

    setErrors(error);

    return Object.keys(error).length === 0;
  };

  const getStrength = () => {
    let score = 0;

    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    return score * 20;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // await axios.patch("/api/security/change-password", {
      //   currentPassword,
      //   newPassword,
      // });

      toast.success("Password updated successfully");

      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>

        <Button disabled={loading} onClick={handleSubmit}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ChangePasswordDialog;
