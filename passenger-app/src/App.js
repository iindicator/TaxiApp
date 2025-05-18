import React, { useEffect, useState } from "react";
import { db } from "../shared/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button"; // Assuming you have a UI library -  Install:  npm install @radix-ui/react-button
import { Input } from "@/components/ui/input";   // Assuming you have a UI library - Install: npm install @radix-ui/react-input
import { Calendar } from "@/components/ui/calendar" //for date - Install: npm install @radix-ui/react-calendar  npm install date-fns
import { format } from "date-fns"; //date formatting -  Install:  npm install date-fns

function PassengerApp() {
  const [drivers, setDrivers] = useState([]);
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null); // Added error state
  const [loading, setLoading] = useState(true); // Added loading state


  useEffect(() => {
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          (err) => {
            console.error("Location error:", err);
            setError("Failed to get your location. Please ensure location services are enabled."); // Set error message
            setLoading(false);
          },
          {
            timeout: 10000, // 10 seconds timeout
          }
        );
      } else {
        setError("Geolocation is not supported by your browser."); // Set error message
        setLoading(false);
      }
    }
    fetchLocation();
  }, []);

  useEffect(() => {
    if (location) { // Only fetch drivers if location is available
      const q = query(
        collection(db, "drivers"),
        where("isApproved", "==", true),
        where("isAvailable", "==", true)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const nearby = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDrivers(nearby);
          setLoading(false);
        },
        (err) => {
          setError("Failed to load drivers: " + err.message); // Set error message
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setError("Current location not available.");
      return;
    }
    if (!destination) {
      setError("Please enter destination.");
      return;
    }

    // Prepare schedule timestamp if provided
    let scheduleTimestamp: Date | null = null;
    if (scheduleDate && scheduleTime) {
      const selectedDateTime = new Date(scheduleDate);
      const [hours, minutes] = scheduleTime.split(":");
      selectedDateTime.setHours(parseInt(hours, 10));
      selectedDateTime.setMinutes(parseInt(minutes, 10));
      scheduleTimestamp = selectedDateTime;
    }
    try {
      setMessage("Ride request submitted!"); // set message
      // In a real app, you would add the ride request to a "rides" collection
      // with passenger, driver, location, destination, and schedule information.
      /*
      await addDoc(collection(db, "rides"), {
        passengerId: auth.currentUser.uid, //  Use actual user ID
        passengerLocation: location,
        destination: destination,
        scheduleTimestamp: scheduleTimestamp || serverTimestamp(),
        status: "pending", // e.g., pending, accepted, completed, cancelled
        driverId: null,  // Initially null, assigned when a driver accepts
        // Add other relevant ride details
      });
      */

      //For now,  Add a delay before clearing the message,
      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error: any) {
      setError("Failed to request ride: " + error.message); // set error
    }
  };
  const generateWhatsAppMessage = (driverName: string) => {
    const passengerName = "John Doe"; // Replace with actual passenger name -  You'll get this from your user authentication system
    const pickupLocationName = location
      ? `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`
      : "Not available";
    const scheduledInfo = scheduleTimestamp
      ? `on ${format(scheduleTimestamp, "PPPppp")}`
      : "as soon as possible";

    const message = `Hi ${driverName}, I'm ${passengerName} and I need a ride from ${pickupLocationName} to ${destination} ${scheduledInfo}.`;
    return encodeURIComponent(message);
  };

  if (loading) return <p>Loading...</p>; // Show loading message
  if (error) return <p style={{ color: "red" }}>{error}</p>; // show error

  return (
    <div style={{ padding: "20px" }}>
      <h2>Request a Ride</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>Destination:</label><br />
          <Input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            placeholder="Enter your destination"
            style={{ padding: "5px", width: "300px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Schedule Ride (optional):</label><br />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Calendar
              mode="single"
              selected={scheduleDate}
              onSelect={setScheduleDate}
            />
            <Input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              placeholder="HH:MM"
              style={{ padding: "5px", width: "100px" }}
            />
          </div>
        </div>

        <Button type="submit" >
          Request Ride
        </Button>
      </form>

      {message && <p>{message}</p>}

      <h3>Available Drivers</h3>
      {drivers.length === 0 && <p>No available drivers nearby right now.</p>}

      {drivers.map((driver) => (
        <div
          key={driver.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <p>
            <strong>Name:</strong> {driver.name}
          </p>
          <p>
            <strong>Phone:</strong> {driver.phone}
          </p>
          <a
            href={`https://wa.me/${driver.phone}?text=${generateWhatsAppMessage(
              driver.name
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "green",
              color: "white",
              padding: "8px",
              borderRadius: "5px",
              textDecoration: "none",
            }}
          >
            Contact Driver on WhatsApp
          </a>
        </div>
      ))}
    </div>
  );
}

export default PassengerApp;