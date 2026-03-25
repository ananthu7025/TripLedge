"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputText } from "@/components/ui/InputText";
import { InputSelect } from "@/components/ui/InputSelect";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckCircle2, AlertCircle } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  propertyType: z.string().min(1, "Property Type is required"),
  serviceNeeded: z.string().min(1, "Service Needed is required"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const propertyTypeOptions = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Other", label: "Other" },
];

const serviceOptions = [
  { value: "Snow Removal", label: "Snow Removal" },
  { value: "Estate Maintenance", label: "Estate Maintenance" },
  { value: "Hardscaping/Paving", label: "Hardscaping/Paving" },
  { value: "Lawn Care & Landscaping", label: "Lawn Care & Landscaping" },
];

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      propertyType: "Residential",
      serviceNeeded: "Lawn Care & Landscaping",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      setSubmitStatus("success");
      form.reset();
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl border-none bg-background/50 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Detailed Estimate Request
        </CardTitle>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Provide us with a few details about your property, and our architectural team will prepare a preliminary consultation brief before we even meet.
        </p>
      </CardHeader>
      <CardContent>
        {submitStatus === "success" ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="h-16 w-16 text-success" />
            <h3 className="text-2xl font-semibold">Thank You!</h3>
            <p className="text-muted-foreground">
              Your request has been submitted successfully. Our team will contact you shortly.
            </p>
            <Button
              variant="outline"
              onClick={() => setSubmitStatus("idle")}
              className="mt-4"
            >
              Submit Another Request
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputText
                label="First Name"
                field="firstName"
                hookForm={form}
                placeholder="John"
                labelMandatory
              />
              <InputText
                label="Last Name"
                field="lastName"
                hookForm={form}
                placeholder="Doe"
                labelMandatory
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputText
                label="Email Address"
                field="email"
                hookForm={form}
                placeholder="john@example.com"
                type="email"
                labelMandatory
              />
              <InputText
                label="Phone Number"
                field="phone"
                hookForm={form}
                placeholder="(306) 000-0000"
                labelMandatory
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputSelect
                label="Property Type"
                field="propertyType"
                hookForm={form}
                options={propertyTypeOptions}
                labelMandatory
              />
              <InputSelect
                label="Service Needed"
                field="serviceNeeded"
                hookForm={form}
                options={serviceOptions}
                labelMandatory
              />
            </div>

            <InputText
                label="Your Message"
                field="message"
                hookForm={form}
                placeholder="Tell us more about your project..."
                labelMandatory={false}
              />

            {submitStatus === "error" && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-danger/10 text-danger text-sm animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <p>Something went wrong. Please try again later.</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.01]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-6 border-t">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                <span>Site analysis included</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                <span>Custom seasonal maintenance</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                <span>Commercial snow removal</span>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
