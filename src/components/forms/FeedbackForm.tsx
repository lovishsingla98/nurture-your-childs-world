import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addFeedbackEntry, saveToLocalStorage } from "@/lib/firestore";

const FeedbackForm = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try Firestore first, fallback to localStorage
      await addFeedbackEntry({ name, email, message });
      toast.success("Thanks for the feedback!");
      setName(""); setEmail(""); setMessage("");
    } catch (error) {
      console.error("Firestore error, falling back to localStorage:", error);
      // Fallback to localStorage
      saveToLocalStorage("nurture_feedback", { name, email, message });
      toast.success("Thanks for the feedback!");
      setName(""); setEmail(""); setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
      <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
      <Textarea placeholder="Share your thoughts..." value={message} onChange={e => setMessage(e.target.value)} required />
      <Button type="submit" variant="soft" disabled={loading}>{loading ? "Sending..." : "Send Feedback"}</Button>
    </form>
  );
};

export default FeedbackForm;
