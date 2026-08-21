using System;
using System.IO;

namespace Requestrr.WebApi.RequestrrBot
{
    // Simple on/off switch for new requests, checked by every request command.
    // Persisted to a text file in the config folder so it survives container restarts.
    public static class RequestPauseState
    {
        private static string FilePath => Path.Combine(SettingsFile.SettingsFolder, "requests_paused.flag");

        private static bool? _cached;

        public static bool IsPaused
        {
            get
            {
                if (_cached.HasValue)
                    return _cached.Value;

                _cached = File.Exists(FilePath);
                return _cached.Value;
            }
        }

        public static void SetPaused(bool paused)
        {
            if (paused)
            {
                File.WriteAllText(FilePath, DateTime.UtcNow.ToString("o"));
            }
            else if (File.Exists(FilePath))
            {
                File.Delete(FilePath);
            }

            _cached = paused;
        }
    }
}
