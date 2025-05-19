import React, { useEffect, useState } from "react";
import { db } from "../shared/firebase";
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button"; // Assuming you have a UI library - Install:  npm install @radix-ui/react-button

function AdminPanelApp() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time updates of drivers collection
    const unsubscribe = onSnapshot(
      collection(db, "drivers"),
      (snapshot) => {
        const data = snapshot.docs
          .filter((doc) => doc.data().isApproved === false)
          .map((doc) => ({ id: doc.id, ...doc.data() }));
        setPending(data);
        setLoading(false);
      },
      (err) => {
        setError("Failed to load drivers: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const approveDriver = async (id) => {
    try {
      await updateDoc(doc(db, "drivers", id), { isApproved: true });
      // The onSnapshot listener will auto-update the list
    } catch (error) {
      setError("Error approving driver: " + err.message);
    }
  };

  const rejectDriver = async (id) => {
    try {
      await deleteDoc(doc(db, "drivers", id));
      // The onSnapshot listener will auto-update the list
    } catch (err: any) {
      setError("Error rejecting driver: " + err.message);
    }
  };

  if (loading) return <p>Loading pending drivers...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Panel - Approve or Reject Drivers</h2>
      {pending.length === 0 && <p>No pending drivers for approval.</p>}
      {pending.map((driver) => (
        <div
          key={driver.id}
          style={{
            marginBottom: "15px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            maxWidth: "400px",
          }}
        >
          <p>
            <strong>Name:</strong> {driver.name}
          </p>
          <p>
            <strong>Phone:</strong> {driver.phone}
          </p>
          <p>
            <strong>License:</strong> {driver.license}
          </p>
          <p>
            <strong>Car Type:</strong> {driver.carType}
          </p>
          <p>
            <strong>Registration Number:</strong> {driver.regNumber}
          </p>
          <p>
            <strong>Taxi License:</strong> {driver.taxiLicense}
          </p>
           <p>
            <strong>Bio:</strong> {driver.bio}
          </p>
          <Button onClick={() => approveDriver(driver.id)} style={{ marginRight: "10px" }}>
            Approve
          </Button>
          <Button variant="destructive" onClick={() => rejectDriver(driver.id)}>
            Reject
          </Button>
        </div>
      ))}
    </div>
  );
}

export default AdminPanelApp;

