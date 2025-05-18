// driver-app/src/RegisterDriver.js
import React, { useState } from "react";
import { db } from "../shared/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input"; // Assuming you have a UI library -  Install:  npm install @radix-ui/react-input
import { Button } from "@/components/ui/button"; // Assuming you have a UI library - Install:  npm install @radix-ui/react-button
import { Textarea } from "@/components/ui/textarea" //Added Textarea - Install: npm install @radix-ui/react-textarea

function RegisterDriver() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    license: "",
    carType: "",
    regNumber: "",
    taxiLicense: "",
    bio: "", // Added bio field
  });
  const [message, setMessage] = useState<string | null>(null); // Added message state
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = "driver_" + Date.now();
    try {
      await setDoc(doc(db, "drivers", uid), {
        ...form,
        isApproved: false,
        isAvailable: false,
        location: null,
      });
      setMessage("Driver registered. Awaiting approval."); // set message
      setError(null);
      //clear form
      setForm({
        name: "",
        phone: "",
        license: "",
        carType: "",
        regNumber: "",
        taxiLicense: "",
        bio: "",
      });
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error: any) {
      setError("Registration failed: " + error.message); // Set error
      setMessage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p>{message}</p>}
      {["name", "phone", "license", "carType", "regNumber", "taxiLicense"].map((field) => (
        <div key={field} style={{ marginBottom: "15px" }}>
          <label>{field}:</label>
          <Input
            name={field}
            placeholder={field}
            value={form[field]}
            onChange={handleChange}
            style={{ width: "300px" }}
            required
          />
        </div>
      ))}
      <div style={{ marginBottom: "15px" }}>
        <label>Bio:</label>
        <Textarea
          name="bio"
          placeholder="Enter a short bio"
          value={form.bio}
          onChange={handleChange}
          style={{ width: "300px" }}
          required
        />
      </div>
      <Button type="submit">Register</Button>
    </form>
  );
}

export default RegisterDriver;
