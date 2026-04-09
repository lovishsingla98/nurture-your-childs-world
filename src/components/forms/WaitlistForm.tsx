import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addWaitlistEntry, saveToLocalStorage } from "@/lib/firestore";

const WaitlistForm = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try Firestore first, fallback to localStorage
      await addWaitlistEntry({ name, email, age, interests });
      toast.success("You're on the list! We'll be in touch soon.");
      setName(""); setEmail(""); setAge(""); setInterests("");
    } catch (error) {
      console.error("Firestore error, falling back to localStorage:", error);
      // Fallback to localStorage
      saveToLocalStorage("nurture_waitlist", { name, email, age, interests });
      toast.success("You're on the list! We'll be in touch soon.");
      setName(""); setEmail(""); setAge(""); setInterests("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 ">
      <div>
        <label htmlFor="waitlist-name" className="sr-only">Your name</label>
        <Input id="waitlist-name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="waitlist-email" className="sr-only">Email address</label>
        <Input id="waitlist-email" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="waitlist-age" className="sr-only">Child age</label>
        <Input id="waitlist-age" placeholder="Child age (e.g., 6)" value={age} onChange={e => setAge(e.target.value)} />
      </div>
      <div>
        <label htmlFor="waitlist-interests" className="sr-only">Interests</label>
        <Textarea id="waitlist-interests" placeholder="Interests (space, music, puzzles...)" value={interests} onChange={e => setInterests(e.target.value)} />
      </div>
      <Button type="submit" variant="hero" disabled={loading} className="">{loading ? "Joining..." : "Join Waitlist"}</Button>
      <p className="text-xs text-muted-foreground">We’ll only email important updates. No spam.</p>
    </form>
  );
};

export default WaitlistForm;
