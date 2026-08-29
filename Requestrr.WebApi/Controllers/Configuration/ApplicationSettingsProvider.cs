using Requestrr.WebApi.RequestrrBot;
using Requestrr.WebApi.config;

namespace Requestrr.WebApi.Controllers.Configuration
{
    public class ApplicationSettingsProvider
    {
        public ApplicationSettings Provide()
        {
            dynamic settings = SettingsFile.Read();

            string theme = "light";
            if (((Newtonsoft.Json.Linq.JObject)settings).TryGetValue("Theme", System.StringComparison.InvariantCultureIgnoreCase, out var themeToken))
            {
                theme = themeToken.ToString();
            }

            return new ApplicationSettings
            {
                Port = (int)settings.Port,
                BaseUrl = (string)settings.BaseUrl,
                DisableAuthentication = (bool)settings.DisableAuthentication,
                Theme = theme,
            };
        }
    }
}