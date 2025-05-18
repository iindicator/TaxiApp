// driver-app/src/RegisterDriver.js
import React, { useState } from "react";
import { db } from "../../shared/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

function RegisterDriver() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    license: "",
    carType: "",
    regNumber: "",
    taxiLicense: ""
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const uid = "driver_" + Date.now();
    await setDoc(doc(db, "drivers", uid), {
      ...form,
      isApproved: false,
      isAvailable: false,
      location: null
    });
    alert("Driver registered. Awaiting approval.");
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
      {["name", "phone", "license", "carType", "regNumber", "taxiLicense"].map(field => (
        <div key={field}>
          <input
            name={field}
            placeholder={field}
            value={form[field]}
            onChange={handleChange}
            style={{ marginBottom: "10px", padding: "5px", width: "200px" }}
          /><br />
        </div>
      ))}
      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterDriver;
