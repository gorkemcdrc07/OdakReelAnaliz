import React from "react";
import { Typography, Box } from "@mui/material";

const EmptyPage = () => {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
            <Typography variant="h4">Bu sayfa hen�z haz�rlanmad�.</Typography>
        </Box>
    );
};

export default EmptyPage;
