import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import axios from "axios";

// Recharts bileşenleri
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";

// ✅ MUI Date Picker ve Locale
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import trLocale from "date-fns/locale/tr";
import TextField from "@mui/material/TextField";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";











const DashboardNew = () => {
    const [tableData, setTableData] = useState([]);
    const [shoPrintedCount, setShoPrintedCount] = useState(0);
    const [shoNotPrintedCount, setShoNotPrintedCount] = useState(0);
    const [uniqueSpotCount, setUniqueSpotCount] = useState(0);
    const [uniqueFiloCount, setUniqueFiloCount] = useState(0);
    const [totalSupplied, setTotalSupplied] = useState(0);
    const [unsupplied, setUnsupplied] = useState(0);
    const [topProjectName, setTopProjectName] = useState("Bilinmeyen Proje");
    const [topProjectSuppliedCount, setTopProjectSuppliedCount] = useState(0);
    const [topProjectUnsuppliedCount, setTopProjectUnsuppliedCount] = useState(0);
      const [selectedDate, setSelectedDate] = useState(new Date());

    const [secondTopProjectName, setSecondTopProjectName] = useState("Bilinmeyen Proje");
    const [secondTopProjectSuppliedCount, setSecondTopProjectSuppliedCount] = useState(0);
    const [secondTopProjectUnsuppliedCount, setSecondTopProjectUnsuppliedCount] = useState(0);

    const [thirdTopProjectName, setThirdTopProjectName] = useState("Bilinmeyen Proje");
    const [thirdTopProjectSuppliedCount, setThirdTopProjectSuppliedCount] = useState(0);
    const [thirdTopProjectUnsuppliedCount, setThirdTopProjectUnsuppliedCount] = useState(0);

    const [fourthTopProjectName, setFourthTopProjectName] = useState("Bilinmeyen Proje");
    const [fourthTopProjectSuppliedCount, setFourthTopProjectSuppliedCount] = useState(0);
    const [fourthTopProjectUnsuppliedCount, setFourthTopProjectUnsuppliedCount] = useState(0);

    const [fifthTopProjectName, setFifthTopProjectName] = useState("");
    const [fifthTopProjectSuppliedCount, setFifthTopProjectSuppliedCount] = useState(0);
    const [fifthTopProjectUnsuppliedCount, setFifthTopProjectUnsuppliedCount] = useState(0);

    const [sixthTopProjectName, setSixthTopProjectName] = useState("");
    const [sixthTopProjectSuppliedCount, setSixthTopProjectSuppliedCount] = useState(0);
    const [sixthTopProjectUnsuppliedCount, setSixthTopProjectUnsuppliedCount] = useState(0);

    const [top5UnfulfilledLabels, setTop5UnfulfilledLabels] = useState([]);
    const [top5UnfulfilledData, setTop5UnfulfilledData] = useState([]);

    const [talepPlanlananCount, setTalepPlanlananCount] = useState(0);


    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!selectedDate) return;

                const selectedISO = selectedDate.toISOString().split("T")[0];
                const startDate = `${selectedISO}T00:00:00`;
                const endDate = `${selectedISO}T23:59:59`;

                const response = await axios.post("/proxy/tmsorders", {
                    startDate,
                    endDate,
                    userId: 1,
                });

                if (response.data && response.data.Data) {
                    const data = response.data.Data;

                    // ✅ 1. Proje sıralama ve setleme
                    const projectNameCounts = data.reduce((acc, curr) => {
                        if (!curr.ProjectName || curr.ProjectName === "AVANSAS DEDİKE") return acc;
                        acc[curr.ProjectName] = (acc[curr.ProjectName] || 0) + 1;
                        return acc;
                    }, {});

                    const sortedProjects = Object.entries(projectNameCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(entry => entry[0]);

                    const topProject = sortedProjects[0] || "Bilinmeyen Proje";
                    const secondTopProject = sortedProjects[1] || "Bilinmeyen Proje";

                    // 1. ve 2. projeleri işle
                    const setProjectData = (projectName, nameSetter, suppliedSetter, unsuppliedSetter) => {
                        nameSetter(projectName);
                        const projectOrders = data.filter(order => order.ProjectName === projectName);
                        const supplied = projectOrders.filter(order =>
                            order.TMSDespatchDocumentNo?.startsWith("SFR") &&
                            (
                                order.VehicleWorkingName === "SPOT" ||
                                ["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName)
                            )
                        );
                        suppliedSetter(supplied.length);

                        const unsupplied = projectOrders.filter(order =>
                            !order.TMSDespatchDocumentNo &&
                            order.TMSVehicleRequestDocumentNo?.startsWith("VP")
                        );
                        unsuppliedSetter(unsupplied.length);
                    };

                    setProjectData(topProject, setTopProjectName, setTopProjectSuppliedCount, setTopProjectUnsuppliedCount);
                    setProjectData(secondTopProject, setSecondTopProjectName, setSecondTopProjectSuppliedCount, setSecondTopProjectUnsuppliedCount);
                    setProjectData(sortedProjects[2], setThirdTopProjectName, setThirdTopProjectSuppliedCount, setThirdTopProjectUnsuppliedCount);
                    setProjectData(sortedProjects[3], setFourthTopProjectName, setFourthTopProjectSuppliedCount, setFourthTopProjectUnsuppliedCount);
                    setProjectData(sortedProjects[4], setFifthTopProjectName, setFifthTopProjectSuppliedCount, setFifthTopProjectUnsuppliedCount);
                    setProjectData(sortedProjects[5], setSixthTopProjectName, setSixthTopProjectSuppliedCount, setSixthTopProjectUnsuppliedCount);

                    // ✅ SHÖ
                    const shoPrinted = new Set(
                        data
                            .filter(order =>
                                order.TMSDespatchDocumentNo?.startsWith("SFR") &&
                                order.IsPrint === true &&
                                ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                                ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                            )
                            .map(o => o.TMSDespatchDocumentNo)
                    );
                    setShoPrintedCount(shoPrinted.size);

                    const shoNotPrinted = new Set(
                        data
                            .filter(order =>
                                order.TMSDespatchDocumentNo?.startsWith("SFR") &&
                                order.IsPrint === false &&
                                ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                                ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                            )
                            .map(o => o.TMSDespatchDocumentNo)
                    );
                    setShoNotPrintedCount(shoNotPrinted.size);

                    // ✅ SPOT ve FİLO siparişleri
                    const spotOrders = data.filter(order =>
                        order.TMSDespatchDocumentNo &&
                        order.TMSDespatchDocumentNo.startsWith("SFR") &&
                        order.VehicleWorkingName === "SPOT" &&
                        order.ServiceName === "YURTİÇİ FTL HİZMETLERİ" &&
                        order.SubServiceName === "FTL HİZMETİ"
                    );
                    const uniqueSpotDespatchSet = new Set(spotOrders.map(o => o.TMSDespatchDocumentNo));
                    setUniqueSpotCount(uniqueSpotDespatchSet.size);

                    const filoOrders = data.filter(order =>
                        order.TMSDespatchDocumentNo &&
                        order.TMSDespatchDocumentNo.startsWith("SFR") &&
                        ["FİLO", "ÖZMAL", "MODERN AMBALAJ FİLO"].includes(order.VehicleWorkingName) &&
                        ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                        ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                    );
                    const uniqueFiloDespatchSet = new Set(filoOrders.map(o => o.TMSDespatchDocumentNo));
                    setUniqueFiloCount(uniqueFiloDespatchSet.size);

                    const combinedDespatchSet = new Set([...uniqueSpotDespatchSet, ...uniqueFiloDespatchSet]);
                    setTotalSupplied(combinedDespatchSet.size);

                    // ✅ TALEP PLANLANAN
                    const talepPlanlananSet = new Set(
                        data
                            .filter(order =>
                                order.TMSVehicleRequestDocumentNo &&
                                !order.TMSVehicleRequestDocumentNo.startsWith("BOS") &&
                                ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                                ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                            )
                            .map(order => order.TMSVehicleRequestDocumentNo)
                    );
                    setTalepPlanlananCount(talepPlanlananSet.size);

                    // ✅ TEDARİK EDİLMEYEN = TALEP PLANLANAN - TEDARİK EDİLEN
                    const calculatedUnsupplied = talepPlanlananSet.size - combinedDespatchSet.size;
                    setUnsupplied(calculatedUnsupplied < 0 ? 0 : calculatedUnsupplied);

                    // ✅ TEDARİK EDİLMEYEN TOP 5 PROJE
                    const unfulfilledOrders = data.filter(order =>
                        !order.TMSDespatchDocumentNo &&
                        order.TMSVehicleRequestDocumentNo?.startsWith("VP") &&
                        ["YURTİÇİ FTL HİZMETLERİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.ServiceName) &&
                        ["FTL HİZMETİ", "FİLO DIŞ YÜK YÖNETİMİ"].includes(order.SubServiceName)
                    );

                    const unfulfilledProjectNameCounts = unfulfilledOrders.reduce((acc, order) => {
                        if (!order.ProjectName || order.ServiceName === "DEDİKE ARAÇ HİZMETLERİ" || order.ProjectName === "AVANSAS DEDİKE") return acc;
                        acc[order.ProjectName] = (acc[order.ProjectName] || 0) + 1;
                        return acc;
                    }, {});

                    const top5UnfulfilledProjects = Object.entries(unfulfilledProjectNameCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);

                    const labels = top5UnfulfilledProjects.map(p => p[0]);
                    const dataCounts = top5UnfulfilledProjects.map(p => p[1]);

                    setTop5UnfulfilledLabels(labels);
                    setTop5UnfulfilledData(dataCounts);

                    // ✅ Kullanıcı bazlı tablo
                    const uniqueDocsMap = new Map();
                    data.forEach(order => {
                        const docNo = order.TMSVehicleRequestDocumentNo?.trim().toUpperCase();
                        if (!docNo || uniqueDocsMap.has(docNo)) return;
                        uniqueDocsMap.set(docNo, order);
                    });

                    const grouped = {};
                    for (const order of uniqueDocsMap.values()) {
                        const user = order.TMSDespatchCreatedBy?.trim();
                        const doc = order.TMSVehicleRequestDocumentNo?.trim().toUpperCase();
                        if (!user || !doc) continue;

                        if (!grouped[user]) {
                            grouped[user] = { TMSDespatchCreatedBy: user, UniqueDocsCount: 0, BosSefer: 0, DoluSefer: 0 };
                        }

                        grouped[user].UniqueDocsCount += 1;
                        if (doc.startsWith("BOS")) grouped[user].BosSefer += 1;
                        else if (doc.startsWith("VP")) grouped[user].DoluSefer += 1;
                    }

                    Object.values(grouped).forEach(user => {
                        user.Count = user.BosSefer + user.DoluSefer;
                    });

                    const finalData = Object.values(grouped).sort((a, b) => b.Count - a.Count);
                    setTableData(finalData);
                }
            } catch (error) {
                console.error("Veri çekme hatası:", error);
            }
        };

        fetchData();
    }, [selectedDate]);


    const pieChartData = [
        { name: "TOPLAM TEDARİK EDİLENLER", value: totalSupplied, color: "#4CAF50" },
        { name: "TOPLAM TEDARİK EDİLMEYENLER", value: unsupplied, color: "#D32F2F" }
    ];

    const secondPieChartData = [
        { name: "Spot", value: uniqueSpotCount, color: "#82ca9d" },
        { name: "Filo", value: uniqueFiloCount, color: "#ff7300" }
    ];

    const projectPieData = [
        { name: "Tedarik Edilen", value: topProjectSuppliedCount, color: "#20b2aa" },
        { name: "Tedarik Edilemeyen", value: topProjectUnsuppliedCount, color: "#ff1493" }
    ];

    const secondProjectPieData = [
        { name: "Tedarik Edilen", value: secondTopProjectSuppliedCount, color: "#20b2aa" },
        { name: "Tedarik Edilemeyen", value: secondTopProjectUnsuppliedCount, color: "#ff1493" }
    ];

    const thirdProjectPieData = [
        { name: "Tedarik Edilen", value: thirdTopProjectSuppliedCount, color: "#20b2aa" },
        { name: "Tedarik Edilemeyen", value: thirdTopProjectUnsuppliedCount, color: "#ff1493" }
    ];

    const fourthProjectPieData = [
        { name: "Tedarik Edilen", value: fourthTopProjectSuppliedCount, color: "#20b2aa" },
        { name: "Tedarik Edilemeyen", value: fourthTopProjectUnsuppliedCount, color: "#ff1493" }
    ];

    const fifthProjectPieData = [
        { name: "Tedarik Edilen", value: fifthTopProjectSuppliedCount, color: "#20b2aa" },
        { name: "Tedarik Edilemeyen", value: fifthTopProjectUnsuppliedCount, color: "#ff1493" }
    ];

    const sixthProjectPieData = [
        { name: "Tedarik Edilen", value: sixthTopProjectSuppliedCount, color: "#20b2aa" },
        { name: "Tedarik Edilemeyen", value: sixthTopProjectUnsuppliedCount, color: "#ff1493" }
    ];



    const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, value
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={20}
      fontWeight="bold"
    >
      {value}
    </text>
  );
};






    return (
      <Box sx={{ height: "calc(100vh - 64px)", p: 2, overflow: "auto" }}>
    <Grid container spacing={2}>
        {/* Tedarik Kartları */}
        <Grid item xs={8}>
            <Grid container spacing={2}>
                {/* Talep Planlanan */}
                 {/* TALEP PLANLANAN */}
    <Grid item xs={4}>
      <Card sx={{ height: "517px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
            TALEP PLANLANAN
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold", color: "black" }}>
            {talepPlanlananCount}

          </Typography>

          <PieChart width={300} height={300}>
            <Pie
              data={pieChartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderCustomizedLabel}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? "#191970" : "#b0c4de"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </CardContent>
      </Card>
    </Grid>

                {/* Tedarik Edilenler */}
               <Grid item xs={4}>
      <Card sx={{ height: "517px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
            TOPLAM TEDARİK EDİLENLER
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold", color: "black" }}>
            {totalSupplied}
          </Typography>

          <PieChart width={300} height={300}>
            <Pie
              data={secondPieChartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderCustomizedLabel}
            >
              {secondPieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? "#20b2aa" : "#191970"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </CardContent>
      </Card>
    </Grid>

                        {/* SHÖ Kartları */}
<Grid item xs={4}>
    <Grid container spacing={2}>
        {/* SHÖ BASILAN */}
        <Grid item xs={12}>
            <Card
                sx={{
                    height: "250px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "3px solid #20b2aa",
                    background: "linear-gradient(135deg, #e0f7fa, #e8f5e9)",
                    boxShadow: "0 0 20px #20b2aa",
                }}
            >
                <CardContent sx={{ textAlign: "center" }}>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", color: "black" }}
                    >
                        SHÖ BASILAN
                    </Typography>
                    <Typography variant="h4" color="primary">
                        {shoPrintedCount}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>

        {/* SHÖ BASILMAYAN */}
        <Grid item xs={12}>
            <Card
                sx={{
                    height: "250px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "3px solid #ff1493",
                    background: "linear-gradient(135deg, #fce4ec, #f3e5f5)",
                    boxShadow: "0 0 15px #ff1493",
                }}
            >
                <CardContent sx={{ textAlign: "center" }}>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", color: "black" }}
                    >
                        SHÖ BASILMAYAN
                    </Typography>
                    <Typography variant="h4" color="error">
                        {shoNotPrintedCount}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
    </Grid>
</Grid>




                        {/* Proje Tedarik Durumu */}
                        <Grid item xs={4}>
                            <Card sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                <CardContent sx={{ textAlign: "center", padding: "10px", position: "relative" }}>
                                    <Typography
  variant="subtitle2"
  sx={{ color: "black", fontWeight: "bold", mb: 1 }}
>
  {topProjectName}
</Typography>


                                    <PieChart width={250} height={180}>
                                        <Pie
                                            data={projectPieData}
                                            dataKey="value"
                                            cx="50%"
                                            cy="80%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={40}
                                            outerRadius={60}
                                            label={false} // Label'leri kaldırıyoruz
                                            labelLine={false}
                                        >
                                            {projectPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const { value } = payload[0];
                                                    return (
                                                        <div style={{ background: "#fff", padding: 6, fontSize: "12px", border: "1px solid #ccc" }}>
                                                            <strong>Değer</strong>: {value}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />

                                        <Legend verticalAlign="bottom" height={25} wrapperStyle={{ marginTop: 5, fontSize: "11px" }} />
                                    </PieChart>

                                    {/* SOLA (TEDARİK EDİLEN) ve SAĞA (TEDARİK EDİLEMEYEN) SAYI EKLEME */}
                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#20b2aa", fontWeight: "bold" }}
                                    >
                                        {projectPieData[0]?.value}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", color: "#ff1493", fontWeight: "bold" }}
                                    >
                                        {projectPieData[1]?.value}
                                    </Typography>

                                </CardContent>
                            </Card>
                        </Grid>


                        {/* Proje Tedarik Durumu 2 */}
                        <Grid item xs={4}>
                            <Card sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                <CardContent sx={{ textAlign: "center", padding: "10px", position: "relative" }}>
                                  <Typography variant="subtitle2" sx={{ color: "black", fontWeight: "bold", mb: 1 }}>
  {secondTopProjectName}
</Typography>



                                    <PieChart width={250} height={180}>
                                        <Pie
                                            data={secondProjectPieData}
                                            dataKey="value"
                                            cx="50%"
                                            cy="80%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={50}
                                            outerRadius={70}
                                            label={false} // Label'leri kaldırdık
                                            labelLine={false}
                                        >
                                            {secondProjectPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const { value } = payload[0];
                                                    return (
                                                        <div style={{ background: "#fff", padding: 6, fontSize: "12px", border: "1px solid #ccc" }}>
                                                            <strong>Değer</strong>: {value}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />

                                        <Legend verticalAlign="bottom" height={30} wrapperStyle={{ marginTop: 5, fontSize: "11px" }} />
                                    </PieChart>

                                    {/* Sol ve Sağ Tarafa Sayıları Ekleyelim */}
                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#20b2aa", fontWeight: "bold" }}
                                    >
                                        {secondProjectPieData[0]?.value}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", color: "#ff1493", fontWeight: "bold" }}
                                    >
                                        {secondProjectPieData[1]?.value}
                                    </Typography>

                                </CardContent>
                            </Card>
                        </Grid>


                        {/* Proje Tedarik Durumu 3 */}
                        <Grid item xs={4}>
                            <Card sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                <CardContent sx={{ textAlign: "center", padding: "10px", position: "relative" }}>
                                   <Typography variant="subtitle2" sx={{ color: "black", fontWeight: "bold", mb: 1 }}>
    {thirdTopProjectName}
</Typography>


                                    <PieChart width={250} height={180}>
                                        <Pie
                                            data={thirdProjectPieData}
                                            dataKey="value"
                                            cx="50%"
                                            cy="80%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={50}
                                            outerRadius={70}
                                            label={false} // Label'leri kaldırdık
                                            labelLine={false}
                                        >
                                            {thirdProjectPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const { value } = payload[0];
                                                    return (
                                                        <div style={{ background: "#fff", padding: 6, fontSize: "12px", border: "1px solid #ccc" }}>
                                                            <strong>Değer</strong>: {value}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />

                                        <Legend verticalAlign="bottom" height={30} wrapperStyle={{ marginTop: 5, fontSize: "11px" }} />
                                    </PieChart>

                                    {/* Sol ve Sağ Tarafa Sayıları Ekleyelim */}
                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#20b2aa", fontWeight: "bold" }}
                                    >
                                        {thirdProjectPieData[0]?.value}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", color: "#ff1493", fontWeight: "bold" }}
                                    >
                                        {thirdProjectPieData[1]?.value}
                                    </Typography>

                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Proje Tedarik Durumu 4 */}
                        <Grid item xs={4}>
                            <Card sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                <CardContent sx={{ textAlign: "center", padding: "10px", position: "relative" }}>
                                   <Typography variant="subtitle2" sx={{ color: "black", fontWeight: "bold", mb: 1 }}>
    {fourthTopProjectName} {/* 4. sıradaki projeyi gösterecek */}
</Typography>


                                    <PieChart width={250} height={180}>
                                        <Pie
                                            data={fourthProjectPieData} // 4. proje için veri seti
                                            dataKey="value"
                                            cx="50%"
                                            cy="80%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={50}
                                            outerRadius={70}
                                            label={false} // Label'leri kaldırdık
                                            labelLine={false}
                                        >
                                            {fourthProjectPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const { value } = payload[0];
                                                    return (
                                                        <div style={{ background: "#fff", padding: 6, fontSize: "12px", border: "1px solid #ccc" }}>
                                                            <strong>Değer</strong>: {value}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />

                                        <Legend verticalAlign="bottom" height={30} wrapperStyle={{ marginTop: 5, fontSize: "11px" }} />
                                    </PieChart>

                                    {/* Sol ve Sağ Tarafa Sayıları Ekleyelim */}
                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#20b2aa", fontWeight: "bold" }}
                                    >
                                        {fourthProjectPieData[0]?.value}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", color: "#ff1493", fontWeight: "bold" }}
                                    >
                                        {fourthProjectPieData[1]?.value}
                                    </Typography>

                                </CardContent>
                            </Card>
                        </Grid>


                        {/* Proje Tedarik Durumu 5 */}
                        <Grid item xs={4}>
                            <Card sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                <CardContent sx={{ textAlign: "center", padding: "10px", position: "relative" }}>
                                   <Typography variant="subtitle2" sx={{ color: "black", fontWeight: "bold", mb: 1 }}>
    {fifthTopProjectName}
</Typography>


                                    <PieChart width={250} height={180}>
                                        <Pie
                                            data={fifthProjectPieData}
                                            dataKey="value"
                                            cx="50%"
                                            cy="80%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={50}
                                            outerRadius={70}
                                            label={false}
                                            labelLine={false}
                                        >
                                            {fifthProjectPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const { value } = payload[0];
                                                    return (
                                                        <div style={{ background: "#fff", padding: 6, fontSize: "12px", border: "1px solid #ccc" }}>
                                                            <strong>Değer</strong>: {value}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />

                                        <Legend verticalAlign="bottom" height={30} wrapperStyle={{ marginTop: 5, fontSize: "11px" }} />
                                    </PieChart>

                                    {/* Sol ve Sağ Tarafa Sayıları Ekleyelim */}
                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#20b2aa", fontWeight: "bold" }}
                                    >
                                        {fifthProjectPieData[0]?.value}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", color: "#ff1493", fontWeight: "bold" }}
                                    >
                                        {fifthProjectPieData[1]?.value}
                                    </Typography>

                                </CardContent>
                            </Card>
                        </Grid>


                        {/* Proje Tedarik Durumu 6 */}
                        <Grid item xs={4}>
                            <Card sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                <CardContent sx={{ textAlign: "center", padding: "10px", position: "relative" }}>
                                  <Typography variant="subtitle2" sx={{ color: "black", fontWeight: "bold", mb: 1 }}>
    {sixthTopProjectName}
</Typography>


                                    <PieChart width={250} height={180}>
                                        <Pie
                                            data={sixthProjectPieData}
                                            dataKey="value"
                                            cx="50%"
                                            cy="80%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={50}
                                            outerRadius={70}
                                            label={false} // Label'leri kaldırdık
                                            labelLine={false}
                                        >
                                            {sixthProjectPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const { value } = payload[0];
                                                    return (
                                                        <div style={{ background: "#fff", padding: 6, fontSize: "12px", border: "1px solid #ccc" }}>
                                                            <strong>Değer</strong>: {value}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />

                                        <Legend verticalAlign="bottom" height={30} wrapperStyle={{ marginTop: 5, fontSize: "11px" }} />
                                    </PieChart>

                                    {/* Sol ve Sağ Tarafa Sayıları Ekleyelim */}
                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#20b2aa", fontWeight: "bold" }}
                                    >
                                        {sixthProjectPieData[0]?.value}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", color: "#ff1493", fontWeight: "bold" }}
                                    >
                                        {sixthProjectPieData[1]?.value}
                                    </Typography>

                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card
                                sx={{
                                    height: 273,
                                    minWidth: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    padding: 2,
                                }}
                            >
                                <CardContent
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        overflow: "hidden",
                                        padding: 0,
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
                                        TEDARİK EDİLMEYEN TOP 5
                                    </Typography>

                                    <Box sx={{ width: "100%", height: "220px", overflow: "hidden" }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={top5UnfulfilledLabels.map((label, index) => ({
                                                    name: label,
                                                    count: top5UnfulfilledData[index],
                                                }))}
                                                margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    interval={0}
                                                    height={50}
                                                    tick={{
                                                        fontSize: 12,
                                                        fontWeight: "bold",  // ✅ Kalın
                                                        fill: "#000",         // ✅ Siyah
                                                    }}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{
                                                        fontSize: 12,
                                                        fontWeight: "bold",  // ✅ Kalın
                                                        fill: "#000",         // ✅ Siyah
                                                    }}
                                                    tickLine={false}
                                                />
                                                <Tooltip />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke="#191970"        // ✅ Çizgi rengi
                                                    strokeWidth={4}         // ✅ Kalın çizgi
                                                    activeDot={{ r: 8 }}
                                                >
                                                    <LabelList
                                                        dataKey="count"
                                                        position="top"
                                                        content={({ x, y, value }) => (
                                                            <text
                                                                x={x}
                                                                y={y - 8}
                                                                fill="#ff1493"        // ✅ Değer rengi
                                                                fontSize={20}         // ✅ Büyük yazı
                                                                fontWeight="bold"     // ✅ Kalın
                                                                textAnchor="middle"
                                                            >
                                                                {value}
                                                            </text>
                                                        )}
                                                    />
                                                </Line>
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} md={4}> {/* ekran küçükse tam, büyükse 1/3 genişlik */}
                    <Card
                        sx={{
                            width: "100%",
                            maxHeight: 429,
                            overflowY: "auto",
                            boxShadow: 3,
                            borderRadius: "12px",
                            padding: 1,
                            marginTop: 2,
                        }}
                    >
                        <CardContent sx={{ textAlign: "center", p: 0 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                                <StaticDatePicker
                                    displayStaticWrapperAs="mobile"
                                    openTo="day"
                                    value={selectedDate}
                                    onChange={(newValue) => setSelectedDate(newValue)}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </CardContent>
                    </Card>
                </Grid>





                <Grid container spacing={2} justifyContent="flex-end" alignItems="flex-start">
                    <Grid item xs={12} md={4}>
                        <Card
                            sx={{
                                position: "relative",
                                top: "-900px",          // Yukarı çekilmiş durumda
                                height: 865,            // 👈 Kartın uzunluğu azaltıldı
                                overflow: "hidden",
                                p: 2,
                                boxShadow: 3,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >

                            <CardContent
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    overflow: "hidden",
                                }}
                            >
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        borderRadius: "8px",
                                        overflowY: "auto",
                                        flex: 1,
                                        boxShadow: 2,
                                    }}
                                >
                                    <Table size="medium" stickyHeader>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
                                                    SEFER AÇAN KULLANICI
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
                                                    TOPLAM AÇTIĞI SEFER
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
                                                    DOLU SEFER
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "18px", color: "#333" }}>
                                                    BOŞ SEFER
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tableData.length > 0 ? (
                                                tableData.map((row, index) => (
                                                    <TableRow
                                                        key={index}
                                                        sx={{
                                                            "&:nth-of-type(odd)": { backgroundColor: "#F9FAFB" },
                                                            "&:hover": { backgroundColor: "#E0E0E0" },
                                                        }}
                                                    >
                                                        <TableCell align="center" sx={{ fontSize: "16px", fontWeight: "bold", color: "#424242" }}>
                                                            {row.TMSDespatchCreatedBy}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontSize: "16px", fontWeight: "bold", color: "#000" }}>
                                                            {row.Count}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontSize: "16px", fontWeight: "bold", color: "#4CAF50" }}>
                                                            {row.DoluSefer}
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontSize: "16px", fontWeight: "bold", color: "#D32F2F" }}>
                                                            {row.BosSefer}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        Bugüne ait veri bulunamadı...
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>




</Grid>
</Box>

    );
};

export default DashboardNew;