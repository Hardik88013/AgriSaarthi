using System.Text.Json.Serialization;

namespace AgriSaarthi.Api.DTOs
{
    public class CropRecommendationRequestDto
    {
        [JsonPropertyName("N")]
        public double N { get; set; }
        
        [JsonPropertyName("P")]
        public double P { get; set; }
        
        [JsonPropertyName("K")]
        public double K { get; set; }
        
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double Ph { get; set; }
        public double Rainfall { get; set; }
    }

    public class CropRecommendationResponseDto
    {
        public string RecommendedCrop { get; set; } = string.Empty;
        public double Confidence { get; set; }
    }
}
