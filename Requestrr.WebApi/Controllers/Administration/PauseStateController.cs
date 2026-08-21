using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Requestrr.WebApi.RequestrrBot;

namespace Requestrr.WebApi.Controllers.Administration
{
    public class PauseRequestModel
    {
        public string Reason { get; set; }

        // Null/omitted means "pause indefinitely, resume manually".
        // Otherwise, minutes from now until it auto-resumes (e.g. 30, 180, or a custom value).
        public int? AutoResumeInMinutes { get; set; }
    }

    [ApiController]
    [Route("/api/administration/pause-state")]
    public class PauseStateController : ControllerBase
    {
        [HttpGet()]
        public IActionResult Get()
        {
            var status = RequestPauseState.GetStatus();
            return Ok(status);
        }

        [HttpPost("pause")]
        [Authorize]
        public IActionResult Pause([FromBody] PauseRequestModel model)
        {
            DateTime? autoResumeAtUtc = null;

            if (model?.AutoResumeInMinutes.HasValue == true && model.AutoResumeInMinutes.Value > 0)
            {
                autoResumeAtUtc = DateTime.UtcNow.AddMinutes(model.AutoResumeInMinutes.Value);
            }

            RequestPauseState.Pause(model?.Reason, autoResumeAtUtc);

            return Ok(RequestPauseState.GetStatus());
        }

        [HttpPost("resume")]
        [Authorize]
        public IActionResult Resume()
        {
            RequestPauseState.Resume();
            return Ok(RequestPauseState.GetStatus());
        }

        [HttpPost("clear-blocked-attempts")]
        [Authorize]
        public IActionResult ClearBlockedAttempts()
        {
            RequestPauseState.ClearBlockedAttempts();
            return Ok(RequestPauseState.GetStatus());
        }
    }
}
