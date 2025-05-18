import React, { useEffect, useState } from "react";
import { db } from "../../shared/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

function App() {
  const [drivers, setDrivers] = useState([]);
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => console.error("Location error:", err)
    );
  }, []);

  useEffect(() => {
    const q = query(collection(db, "drivers"), where("isApproved", "==", true), where("isAvailable", "==", true));
    const unsub = onSnapshot(q, snapshot => {
      const nearby = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrivers(nearby);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!location) {
      alert("Current location not available.");
      return;
    }
    if (!destination) {
      alert("Please enter destination.");
      return;
    }

    // Prepare schedule timestamp if provided
    let scheduleTimestamp = null;
    if (scheduleDate && scheduleTime) {
      scheduleTimestamp = new Date(`${scheduleDate}T${scheduleTime}`);
      if (isNaN(scheduleTimestamp.getTime())) scheduleTimestamp = null;
    }

    try {
      await addDoc(collection(db, "rideRequests"), {
        currentLocation: location,
        destinationAddress: destination,
        scheduleFor: scheduleTimestamp ? scheduleTimestamp : null,
        createdAt: serverTimestamp(),
        status: "pending"
      });
      setMessage("Ride request saved successfully!");
      // Reset form
      setDestination("");
      setScheduleDate("");
      setScheduleTime("");
    } catch (error) {
      console.error("Error saving ride request:", error);
      setMessage("Failed to save ride request.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Nearby Drivers</h2>

      {location && (
        <p>
          <strong>Your Current Location:</strong> Lat {location.lat.toFixed(4)}, Lng {location.lng.toFixed(4)}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>Destination Address:</label><br />
          <input
            type="text"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="Enter destination"
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Schedule Ride (optional):</label><br />
          <input
            type="date"
            value={scheduleDate}
            onChange={e => setScheduleDate(e.target.value)}
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <input
            type="time"
            value={scheduleTime}
            onChange={e => setScheduleTime(e.target.value)}
            style={{ padding: "5px" }}
          />
        </div>

        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Request Ride
        </button>
      </form>

      {message && <p>{message}</p>}

      <h3>Available Drivers</h3>
      {drivers.length === 0 && <p>No available drivers nearby right now.</p>}

      {drivers.map(driver => (
        <div key={driver.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <p><strong>Name:</strong> {driver.name}</p>
          <p><strong>Phone:</strong> {driver.phone}</p>
          <a
            href={`https://wa.me/${driver.phone}?text=Hi%20${encodeURIComponent(driver.name)},%20I%20would%20like%20a%20ride.`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "green", color: "white", padding: "8px", textDecoration: "none", borderRadius: "4px" }}
          >
            WhatsApp
          </a>
        </div>
      ))}
    </div>
  );
}

export default App;
