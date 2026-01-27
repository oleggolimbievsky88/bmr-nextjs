"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { asBlank } from "@/lib/display";
import AccountProfileForm, {
  getDefaultProfileForm,
} from "./AccountProfileForm";

const createFormFromProfile = (profile) => ({
  ...getDefaultProfileForm(),
  firstname: asBlank(profile?.firstname),
  lastname: asBlank(profile?.lastname),
  email: asBlank(profile?.email),
  phonenumber: asBlank(profile?.phonenumber),
  address1: asBlank(profile?.address1),
  address2: asBlank(profile?.address2),
  city: asBlank(profile?.city),
  state: asBlank(profile?.state),
  zip: asBlank(profile?.zip),
  country: asBlank(profile?.country) || "United States",
  shippingfirstname: asBlank(profile?.shippingfirstname),
  shippinglastname: asBlank(profile?.shippinglastname),
  shippingaddress1: asBlank(profile?.shippingaddress1),
  shippingaddress2: asBlank(profile?.shippingaddress2),
  shippingcity: asBlank(profile?.shippingcity),
  shippingstate: asBlank(profile?.shippingstate),
  shippingzip: asBlank(profile?.shippingzip),
  shippingcountry: asBlank(profile?.shippingcountry) || "United States",
});

export default function AccountEdit() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState(() => getDefaultProfileForm());
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/my-profile");
      const data = await response.json();

      if (data.success && data.user) {
        setFormData(createFormFromProfile(data.user));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      fetchUserData();
    }
  }, [fetchUserData, router, session, status]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    setMessage({ type: "", text: "" });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setMessage({ type: "", text: "" });

      if (formData.password) {
        if (formData.password.length < 8) {
          setMessage({
            type: "error",
            text: "Password must be at least 8 characters long",
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setMessage({
            type: "error",
            text: "Passwords do not match",
          });
          return;
        }
      }

      setIsLoading(true);

      try {
        const updateData = { ...formData };
        delete updateData.confirmPassword;

        if (!updateData.password) {
          delete updateData.password;
        }

        const response = await fetch("/api/auth/update-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update profile");
        }

        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setFormData((prevForm) => ({
          ...prevForm,
          password: "",
          confirmPassword: "",
        }));
      } catch (error) {
        console.error("Update error:", error);
        setMessage({
          type: "error",
          text: error.message || "An error occurred. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData],
  );

  if (status === "loading" || isLoadingData) {
    return (
      <div className="my-account-content account-edit">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="my-account-content account-edit">
      <div className="dashboard-card">
        <AccountProfileForm
          idPrefix="account-edit"
          title="Account Details"
          description="Update your personal details and addresses."
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
          message={message}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
