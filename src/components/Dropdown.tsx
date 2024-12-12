import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';

const Dropdown = ({ participants, onChange, value }: { participants: any, onChange: (val: any) => void, value: any }) => {
    const renderValue = () => {
        const selectedValue = value.reduce((newValue: any, item: any) => {
            newValue.push(participants[item].name);
            return newValue;
        }, []);
        return selectedValue.join(',')
    };

    return (
        <Select
            size='small'
            MenuProps={{
                PaperProps: {
                    sx: {
                        bgcolor: "#ccc",
                        "& .MuiMenuItem-root": {
                            padding: "0 20px",
                            "&:hover": {
                                bgcolor: "rgba(0, 123, 255, 0.1)",
                            },
                        },
                    },
                },
            }}
            sx={{
                bgcolor: "#ccc",
            }}
            multiple
            value={value}
            onChange={(e) => onChange(e.target.value)}
            renderValue={renderValue}

        >
            {Object.keys(participants).map((participant) => (
                <MenuItem key={participant} value={participant}>
                    <Checkbox
                        sx={{
                            color: "#333",
                            "&.Mui-checked": {
                                color: "#2bb24c",
                            },
                        }}
                        checked={value.includes(participant)}
                    />
                    <ListItemText primary={participants[participant].name} />
                </MenuItem>
            ))}
        </Select>
    );
};

export default Dropdown;
