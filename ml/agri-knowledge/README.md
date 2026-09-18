# AgriSaarthi Pest & Disease Intelligence Knowledge Base

This directory contains the local, structured JSON knowledge base for the
Pest & Disease Intelligence module in the AgriSaarthi platform.

---

## File Structure

| File | Purpose |
|------|---------|
| `crops.json` | Master list of supported crop metadata (id, name, scientific name) |
| `diseases.json` | Crop disease entries aligned with PlantVillage ML class labels |
| `pests.json` | Common agricultural pest entries |
| `advisories.json` | Deterministic weather-threshold rules for risk advisories |
| `README.md` | This file |

---

## Crops in crops.json (Metadata Only)

The following 8 crops are registered in `crops.json` with basic metadata:

| Crop ID | Common Name | Scientific Name |
|---------|-------------|----------------|
| tomato | Tomato | Solanum lycopersicum |
| potato | Potato | Solanum tuberosum |
| pepper_bell | Pepper / Bell Pepper | Capsicum annuum |
| rice | Rice | Oryza sativa |
| wheat | Wheat | Triticum aestivum |
| maize | Maize | Zea mays |
| cotton | Cotton | Gossypium |
| sugarcane | Sugarcane | Saccharum officinarum |

> **Note**: Rice, Wheat, Maize, Cotton, and Sugarcane are currently registered
> as metadata only. They do **not** yet have corresponding entries in
> `diseases.json` or `pests.json`. Additional entries will be added in future phases.

---

## Disease Entries (diseases.json)

Only the following crops currently have disease knowledge entries.
These IDs are aligned with PlantVillage ML model class labels.

### Potato
| Entry ID | Type | Severity |
|----------|------|----------|
| `Potato___Late_blight` | Disease | High |
| `Potato___Early_blight` | Disease | Moderate |
| `Potato___healthy` | **Healthy reference class** | None |

### Tomato
| Entry ID | Type | Severity |
|----------|------|----------|
| `Tomato___Late_blight` | Disease | High |
| `Tomato___Target_Spot` | Disease | Moderate |
| `Tomato___healthy` | **Healthy reference class** | None |

### Pepper / Bell Pepper
| Entry ID | Type | Severity |
|----------|------|----------|
| `Pepper__bell___Bacterial_spot` | Disease | High |
| `Pepper__bell___healthy` | **Healthy reference class** | None |

### Important: Healthy Reference Classes

Entries with `"severity": "None"` (e.g., `Potato___healthy`) are **NOT diseases**.
They are **PlantVillage reference classes** indicating a healthy crop scan.
- They are stored alongside disease entries so that the ML model output ID can always
  be looked up — including when the prediction is "healthy".
- The frontend filters them from disease lists and shows a "Crop appears healthy!" message instead.
- They must NOT be displayed as diseases anywhere in the UI.

---

## Pest Entries (pests.json)

Only the following crops currently have pest knowledge entries:

| Pest ID | Crop | Severity |
|---------|------|----------|
| `tomato_hornworm` | Tomato | High |
| `aphids` | Potato | Moderate |
| `whitefly` | Pepper / Bell Pepper | Moderate |

Rice, Wheat, Maize, Cotton, and Sugarcane currently have **no pest entries**.

---

## Advisory Rules (advisories.json)

Deterministic weather-threshold rules. These rules apply generically to all
crops — they do not diagnose a specific disease.

| Rule ID | Trigger Condition | Risk Level |
|---------|------------------|------------|
| `high_rain_fungal` | rain_sum > 20 mm | High |
| `high_humidity` | humidity > 85% | Moderate |
| `high_temp` | temperature_max > 35°C | Moderate |
| `strong_wind` | wind_speed > 25 km/h | Low |

**Important**: A triggered advisory indicates a weather *risk condition*, NOT a
confirmed disease presence. It must never be presented as proof that a specific
disease exists.

---

## Architecture

```
React Frontend (/pest-disease, /weather, /disease-detection)
       ↓ JWT-authenticated API calls
ASP.NET Core API (/api/agri-knowledge/*)
       ↓ reads static JSON files
ml/agri-knowledge/*.json
```

The `AgriKnowledgeService` loads JSON files at request time from the
`ml/agri-knowledge/` directory relative to the backend project root.
No database tables are used for this knowledge base.

---

## Limitations

- Knowledge base currently only covers Tomato, Potato, and Pepper in detail.
- Rice, Wheat, Maize, Cotton, and Sugarcane have metadata entries only.
- Advisory rules are generic weather thresholds, not crop-specific disease models.
- All information is for advisory purposes only.
- Farmers should consult local agricultural extension officers for confirmed diagnosis and treatment recommendations.

---

## Disclaimer

The information in this knowledge base is for **general agricultural advisory purposes only**.
It does **NOT** represent confirmed agronomical diagnosis, guaranteed treatments, or
professional agricultural advice. Do NOT follow pesticide or chemical application
guidance without consulting a qualified agricultural expert.
