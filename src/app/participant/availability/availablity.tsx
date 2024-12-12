'use client';

import { Fragment, useState } from "react";
import DatePicker from "@/components/DatePicker";
import Dropdown from "@/components/Dropdown";
import { LoadingButton } from "@mui/lab";
import { Box, Typography } from "@mui/material";

export default function Availability({ participants }: { participants: any }) {
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([1]);
    const [startDate, setStartDate] = useState<string>("2024-10-28");
    const [endDate, setEndDate] = useState<string>("2024-10-30");
    const [loading, setLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});

    const handleCheckAvailability = async (e: React.FormEvent) => {
        e.preventDefault();

        const requestPayload = {
            participant_ids: selectedParticipants,
            date_range: {
                start: startDate,
                end: endDate,
            },
        };
        setLoading(true)
        try {
            const response = await fetch('/api/check-availability/availablityChecker', {
                method: 'POST', // Ensure it's a POST request
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestPayload),
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableSlots(data);
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false)
        }
    };



    return (
        <Box display="grid" justifyContent="center" alignItems="center" mt={3}>
            <Box border="1px solid black" display="flex" flexDirection="column" height="100%" p={5} gap={5}>
                <Typography variant="h4" textAlign={"center"}>Check Availability</Typography>
                <Dropdown value={selectedParticipants} participants={participants} onChange={setSelectedParticipants} />
                <DatePicker label="Start Date" value={startDate} onChangeAction={setStartDate} />
                <DatePicker label="End Date" value={endDate} onChangeAction={setEndDate} />
                <LoadingButton
                    variant="contained"
                    onClick={handleCheckAvailability}
                    loading={loading}
                >
                    Check Slot
                </LoadingButton>
                {Object.keys(availableSlots).length > 0 && (
                    <Box width={'400px'} p={5} mt={3} bgcolor={'#f5f0e6'} borderRadius={'10px'}>
                        <Typography variant="h6" textAlign={'center'} sx={{ textDecoration: 'underline' }}>Available Slots:</Typography>
                        {Object.entries(availableSlots).map(([date, slots]) => (
                            <Box key={date} display={'flex'} justifyContent={'space-between'} >
                                <Box minWidth={'100px'} pt={1}>
                                    <Typography variant="subtitle1">{date} : </Typography>
                                </Box>
                                <Box mt={1} display={'flex'} justifyItems={"center"} alignItems={"center"} flexWrap={'wrap'} gap={2}>
                                    {slots.map((slot) => <Box key={slot} p={1} bgcolor={'#5f5fe1'} color={'#fff'} borderRadius={'10px'}>
                                        <Typography variant="body2">{slot}</Typography>
                                    </Box>)}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
