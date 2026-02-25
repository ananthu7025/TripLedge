"use client";

import { BookOpen, ChevronDown, Mail, Phone, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { InputText } from "@/components/ui/InputText";

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "How do I add a new user?",
            answer: "Go to Users → Add User. Fill in their name, email, and role. They will receive an email invite with a temporary password."
        },
        {
            question: "How do check-in requests work?",
            answer: "When a technician is outside the geofence or not on verified WiFi, they submit a check-in request. Admins can approve or reject from the Check-In Requests page."
        },
        {
            question: "How are targets distributed?",
            answer: "You can set equal distribution (target ÷ users) or custom per-user targets. Go to Targets → Create Target to set up."
        },
        {
            question: "Can I export attendance data?",
            answer: "Yes. Go to Attendance and click \"Export CSV\" to download the attendance sheet."
        },
        {
            question: "What happens if a user misses checkout?",
            answer: "If a user checks in but does not check out within 24 hours, the system flags it as \"Missing Checkout\" in the Attendance page."
        }
    ];

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <>
            <div>
                <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
                <p className="text-sm text-muted-foreground">FAQs, contact info, and issue reporting</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* FAQ */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" /> Frequently Asked Questions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border-b last:border-0">
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-sm text-foreground text-left w-full"
                                    >
                                        {faq.question}
                                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground ${openIndex === index ? "rotate-180" : ""}`} />
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                                        <div className="pb-4 pt-0 text-sm text-muted-foreground">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact + Report */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Support</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Email</p>
                                    <p className="text-xs text-muted-foreground">support@tripledge.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Phone className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Phone</p>
                                    <p className="text-xs text-muted-foreground">+1 (306) 445-1700</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Report an Issue</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium leading-none text-foreground">Subject</label>
                                <InputText placeholder="Brief description…" className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none text-foreground">Details</label>
                                <textarea placeholder="Describe the issue in detail…" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1" rows={4} />
                            </div>
                            <Button className="gap-2">
                                <Send className="h-4 w-4" /> Submit
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
