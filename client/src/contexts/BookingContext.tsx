import React, { createContext, useContext, useState, ReactNode } from "react";

export type ServiceType = "CHILD" | "UNIVERSITY";

export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  country: string;
  language: string;
  avatar?: string;
  nextAvailable?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface BookingData {
  // Step 1: Service & Specialist
  serviceType?: ServiceType;
  specialistId?: string;
  autoAssign?: boolean;

  // Step 2: Date & Time
  selectedDate?: string;
  selectedTimeSlot?: string;

  // Step 3: User Data
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentCountry?: string;
  userRole?: "PARENT" | "STUDENT";

  // Patient Data
  patientName?: string;
  patientAge?: number;
  patientGrade?: string;
  patientUniversity?: string;
  patientYear?: string;
  previousAssessment?: boolean;
  notes?: string;

  // Agreements
  privacyAgreed?: boolean;
  disclaimerAgreed?: boolean;
  guardianAgreed?: boolean;
}

interface BookingContextType {
  currentStep: number;
  bookingData: BookingData;
  setCurrentStep: (step: number) => void;
  updateBookingData: (data: Partial<BookingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setBookingData({});
  };

  return (
    <BookingContext.Provider
      value={{
        currentStep,
        bookingData,
        setCurrentStep,
        updateBookingData,
        nextStep,
        prevStep,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
