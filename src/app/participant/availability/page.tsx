import Availability from "./availablity";

export default async function AvailabilityWrapper() {
    const response = await fetch(`http://localhost:3000/api/check-availability/data?type=participants`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch participants");
    }

    const participants = await response.json();

    return <Availability participants={participants} />;
}
