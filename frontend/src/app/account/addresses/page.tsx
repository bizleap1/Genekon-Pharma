"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Home,
  Briefcase,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  Phone
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { MOCK_ADDRESSES, CustomerAddress } from "@/data/customer";
import { useAuthStore } from "@/stores/authStore";

export default function SavedAddressesPage() {
  const { isLoggedIn, openLoginModal } = useAuthStore();
  const [addresses, setAddresses] = useState<CustomerAddress[]>(MOCK_ADDRESSES);

  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal(
        {
          type: "SAVED_ADDRESSES",
          title: "Saved Addresses",
          redirectUrl: "/account/addresses",
        },
        "Login required to view and manage your saved addresses"
      );
    }
  }, [isLoggedIn, openLoginModal]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "Home" as "Home" | "Work" | "Clinic",
    name: "Prerna Sharma",
    phone: "9370102691",
    addressLine: "",
    locality: "",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440013",
    isDefault: false,
  });

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...formData } : a))
      );
    } else {
      const newAddr: CustomerAddress = {
        id: `addr-${Date.now()}`,
        ...formData,
      };
      if (formData.isDefault) {
        setAddresses((prev) => [
          newAddr,
          ...prev.map((a) => ({ ...a, isDefault: false })),
        ]);
      } else {
        setAddresses((prev) => [...prev, newAddr]);
      }
    }
    setShowModal(false);
    setEditingId(null);
  };

  const openAdd = () => {
    setFormData({
      type: "Home",
      name: "Prerna Sharma",
      phone: "9370102691",
      addressLine: "",
      locality: "",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: "440013",
      isDefault: false,
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (addr: CustomerAddress) => {
    setFormData({
      type: addr.type,
      name: addr.name,
      phone: addr.phone,
      addressLine: addr.addressLine,
      locality: addr.locality,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowModal(true);
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
            <span className="text-[#14304A] font-semibold">Saved Addresses</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar */}
            <AccountSidebar />

            {/* Main Content */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Header */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E3EDE1] gap-4">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] font-bold">
                      Saved Delivery Addresses
                    </h1>
                    <p className="text-xs sm:text-sm text-[#617564] mt-0.5">
                      Manage your delivery locations for faster medicine and chronic care checkouts.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`rounded-2xl border p-5 sm:p-6 shadow-2xs transition-all flex flex-col justify-between ${
                        addr.isDefault
                          ? "border-[#559620] bg-linear-to-b from-[#F7FAF6] to-white ring-1 ring-[#559620]/20"
                          : "border-[#E3EDE1] bg-white"
                      }`}
                    >
                      <div>
                        {/* Type & Default Pill */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-[#F0F5F2] text-[#14304A]">
                              {addr.type === "Home" ? (
                                <Home className="w-3 h-3 text-[#559620]" />
                              ) : (
                                <Briefcase className="w-3 h-3 text-[#1853A8]" />
                              )}
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EDF7E9] text-[#447719]">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(addr)}
                              className="p-1.5 text-[#738775] hover:text-[#14304A] transition-colors"
                              title="Edit address"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(addr.id)}
                              className="p-1.5 text-[#738775] hover:text-red-500 transition-colors"
                              title="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Recipient */}
                        <h4 className="font-bold text-[#14304A] text-sm">
                          {addr.name}
                        </h4>
                        <p className="text-xs text-[#5D7160] mt-1.5 leading-relaxed">
                          {addr.addressLine}, {addr.locality}
                        </p>
                        <p className="text-xs text-[#5D7160]">
                          {addr.city}, {addr.state} - <span className="font-bold text-[#14304A]">{addr.pincode}</span>
                        </p>
                        <p className="text-xs text-[#6E8270] mt-2 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#559620]" />
                          <span>+91 {addr.phone}</span>
                        </p>
                      </div>

                      {/* Default Toggle CTA */}
                      <div className="mt-5 pt-3 border-t border-[#EAF2E8]">
                        {!addr.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-xs font-bold text-[#559620] hover:underline cursor-pointer"
                          >
                            Set as Default Address
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-[#559620] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Used for primary doorstep delivery
                          </span>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>

        </Container>
      </main>

      {/* Add / Edit Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-[#DCE8D8]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E3EDE1]">
              <h3 className="font-serif text-lg font-bold text-[#14304A]">
                {editingId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[#859987] hover:text-[#14304A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#14304A] mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14304A] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Flat, House No., Building *
                </label>
                <input
                  type="text"
                  required
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="e.g. Flat 402, Green Valley Apts"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#14304A] mb-1">
                    Area / Street *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="Katol Road"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14304A] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14304A] mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Address Type
                </label>
                <div className="flex items-center gap-2">
                  {(["Home", "Work", "Clinic"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formData.type === t
                          ? "bg-[#559620] text-white"
                          : "bg-[#FAFCFB] border border-[#D0DED1] text-[#14304A]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#14304A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded text-[#559620] focus:ring-[#559620] h-4 w-4"
                  />
                  <span>Make this my default delivery address</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E3EDE1] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#14304A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
