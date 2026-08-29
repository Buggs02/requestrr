using Requestrr.WebApi.RequestrrBot;
using Requestrr.WebApi.config;

namespace Requestrr.WebApi.Controllers.Configuration
{
    public static class ApplicationSettingsRepository
    {
        public static void Update(ApplicationSettings applicationSettings)
        {
            SettingsFile.Write(settings =>
            {
                settings.Port = applicationSettings.Port;
                settings.BaseUrl = applicationSettings.BaseUrl;
                settings.DisableAuthentication = applicationSettings.DisableAuthentication;

                if (((Newtonsoft.Json.Linq.JObject)settings).TryGetValue("Theme", System.StringComparison.InvariantCultureIgnoreCase, out _))
                {
                    settings.Theme = applicationSettings.Theme;
                }
                else
                {
                    ((Newtonsoft.Json.Linq.JObject)settings).Add("Theme", applicationSettings.Theme);
                }
            });
        }
    }
}
