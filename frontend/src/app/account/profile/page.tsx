"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Edit3,
  Save
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { MOCK_CUSTOMER } from "@/data/customer";

export default function ProfilePage() {
  const [profile, setProfile] = useState(MOCK_CUSTOMER);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
      <UtilityBar />
      <Header />
      <CategoryNav />

      <main className="flex-1 py-8 sm:py-12">
        <Container>
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#6F8271] mb-6">
            <Link href="/" className="hover:text-[#14304A] transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <Link href="/account" className="hover:text-[#14304A] transition-colors">
              My Account
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">My Profile</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar */}
            <AccountSidebar />

            {/* Main Content */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Profile Card */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-10 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E3EDE1] gap-4">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] font-bold">
                      Personal Profile
                    </h1>
                    <p className="text-xs sm:text-sm text-[#617564] mt-1">
                      Manage your registered contact information and medical identification details.
                    </p>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] hover:bg-[#F0F5F1] text-xs font-bold text-[#14304A] transition-all cursor-pointer shadow-2xs shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#559620]" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs font-bold text-[#718573] hover:underline shrink-0 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {savedSuccess && (
                  <div className="mb-6 p-4 rounded-2xl bg-[#EDF7E9] border border-[#C6E2C2] text-[#447719] text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#559620]" />
                    <span>Your profile information has been saved successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  
                  {/* Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] font-semibold disabled:opacity-75 disabled:bg-[#F5F8F6] focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    {/* Mobile Number with verified badge */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#14304A]">
                          Registered Mobile
                        </label>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#559620] bg-[#EDF7E9] px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <div className="flex items-center rounded-xl border border-[#D0DED1] bg-[#F5F8F6] overflow-hidden opacity-75">
                        <span className="px-3 py-2.5 text-xs font-bold text-[#627664] bg-[#EBF0EC] border-r border-[#D0DED1]">
                          +91
                        </span>
                        <input
                          type="tel"
                          disabled
                          value={profile.phone}
                          className="w-full text-xs sm:text-sm px-3 py-2.5 text-[#14304A] font-semibold bg-transparent outline-none cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[10px] text-[#718573] mt-1">
                        Mobile number is linked to your OTP security credentials.
                      </p>
                    </div>
                  </div>

                  {/* Email & Date of Birth */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled={!isEditing}
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] font-semibold disabled:opacity-75 disabled:bg-[#F5F8F6] focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1.5">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        disabled={!isEditing}
                        value={profile.dateOfBirth}
                        onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] font-semibold disabled:opacity-75 disabled:bg-[#F5F8F6] focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#14304A] mb-2">
                      Gender
                    </label>
                    <div className="flex items-center gap-3">
                      {(["Female", "Male", "Other"] as const).map((g) => {
                        const isSelected = profile.gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            disabled={!isEditing}
                            onClick={() => setProfile({ ...profile, gender: g })}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-[#559620] text-white shadow-2xs"
                                : "bg-[#FAFCFB] border border-[#D0DED1] text-[#14304A] hover:bg-[#F0F5F1] disabled:opacity-60"
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Bar */}
                  {isEditing && (
                    <div className="pt-4 border-t border-[#EAF2E8] flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#14304A] hover:bg-[#F2F7F2] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}

                </form>

              </div>

              {/* Security & Confidentiality Box */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-[#FAFCFA] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#14304A]">
                      Passwordless Healthcare Account
                    </h4>
                    <p className="text-xs text-[#637766] mt-0.5 leading-relaxed">
                      Genekon utilizes password-free single-use SMS OTPs to eliminate phishing risks and safeguard sensitive prescription histories.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
