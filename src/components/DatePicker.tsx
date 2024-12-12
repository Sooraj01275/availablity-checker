'use client'
import React from "react";
import TextField from "@mui/material/TextField";

interface DatePickerProps {
    label: string;
    value: string;
    onChangeAction: (val: any) => void
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChangeAction }) => {
    return (
        <TextField
            fullWidth
            type="date"
            value={value}
            onChange={(e) => onChangeAction(e.target.value)}
            sx={{ bgcolor: "#ccc", borderRadius: 1 }}
            size="small"
        />
    );
};

export default DatePicker;
