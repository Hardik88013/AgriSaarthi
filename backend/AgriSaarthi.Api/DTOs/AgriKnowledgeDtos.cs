using System.Collections.Generic;

namespace AgriSaarthi.Api.DTOs
{
    public class CropDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string ScientificName { get; set; }
    }

    public class DiseaseDto
    {
        public string Id { get; set; }
        public string Crop { get; set; }
        public string Name { get; set; }
        public List<string> Symptoms { get; set; }
        public List<string> FavorableConditions { get; set; }
        public List<string> Prevention { get; set; }
        public List<string> Management { get; set; }
        public string Severity { get; set; }
    }

    public class PestDto
    {
        public string Id { get; set; }
        public string Crop { get; set; }
        public string Name { get; set; }
        public List<string> Symptoms { get; set; }
        public List<string> FavorableConditions { get; set; }
        public List<string> Prevention { get; set; }
        public List<string> Management { get; set; }
        public string Severity { get; set; }
    }

    public class WeatherAdvisoryRuleDto
    {
        public string Id { get; set; }
        public string Condition { get; set; }
        public string Title { get; set; }
        public string RiskLevel { get; set; }
        public List<string> Alerts { get; set; }
        public List<string> Recommendations { get; set; }
    }

    public class AdvisoryResponseDto
    {
        public string RiskLevel { get; set; }
        public List<string> Alerts { get; set; }
        public List<string> Recommendations { get; set; }
    }
}
