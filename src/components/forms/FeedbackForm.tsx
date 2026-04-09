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
    <form onSubmit={onSubmit} className="grid gap-3 ">
      <div>
        <label htmlFor="feedback-name" className="sr-only">Your name</label>
        <Input id="feedback-name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="feedback-email" className="sr-only">Email address</label>
        <Input id="feedback-email" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="feedback-message" className="sr-only">Your feedback</label>
        <Textarea id="feedback-message" placeholder="Share your thoughts..." value={message} onChange={e => setMessage(e.target.value)} required />
      </div>
      <Button type="submit" variant="soft" disabled={loading} className="">{loading ? "Sending..." : "Send Feedback"}</Button>
    </form>
  );
};

export default FeedbackForm;
