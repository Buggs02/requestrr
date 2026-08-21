import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { Alert } from "reactstrap";
import {
  getPauseState,
  pauseRequests,
  resumeRequests,
  clearBlockedAttempts
} from "../store/actions/AdministrationActions";

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
  Table
} from "reactstrap";

const DURATION_PRESETS = [
  { label: "Until manually resumed", minutes: null },
  { label: "30 minutes", minutes: 30 },
  { label: "3 hours", minutes: 180 },
  { label: "Custom", minutes: "custom" }
];

function Administration() {

  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPausedState] = useState(false);
  const [reasonOnServer, setReasonOnServer] = useState(null);
  const [autoResumeAtUtc, setAutoResumeAtUtc] = useState(null);
  const [blockedAttempts, setBlockedAttempts] = useState([]);

  const [reasonInput, setReasonInput] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(DURATION_PRESETS[0]);
  const [customMinutes, setCustomMinutes] = useState("60");
  const [isSaving, setIsSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const dispatch = useDispatch();

  const applyStatus = data => {
    setIsPausedState(!!data.isPaused);
    setReasonOnServer(data.reason);
    setAutoResumeAtUtc(data.autoResumeAtUtc);
    setBlockedAttempts(data.blockedAttempts || []);
  };

  useEffect(() => {
    dispatch(getPauseState())
      .then(data => {
        setIsLoading(false);
        applyStatus(data);
      });
  }, []);

  const onPause = e => {
    e.preventDefault();

    if (isSaving) return;

    let minutes = null;

    if (selectedDuration.minutes === "custom") {
      const parsed = parseInt(customMinutes, 10);
      minutes = isNaN(parsed) || parsed <= 0 ? null : parsed;
    } else {
      minutes = selectedDuration.minutes;
    }

    setIsSaving(true);
    dispatch(pauseRequests(reasonInput, minutes))
      .then(data => {
        setIsSaving(false);
        setActionMessage("Requests paused.");
        applyStatus(data);
      });
  };

  const onResume = e => {
    e.preventDefault();

    if (isSaving) return;

    setIsSaving(true);
    dispatch(resumeRequests())
      .then(data => {
        setIsSaving(false);
        setActionMessage("Requests resumed.");
        applyStatus(data);
      });
  };

  const onClearBlockedAttempts = e => {
    e.preventDefault();
    dispatch(clearBlockedAttempts()).then(data => applyStatus(data));
  };

  const formatLocal = isoString => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <>
        <Row className="mt-4">
          <Col className="order-xl-1" xl="12">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Request Administration</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className={isLoading ? "fade" : "fade show"}>

                <Alert color={isPaused ? "danger" : "success"} className="text-center">
                  {isPaused ? (
                    <>
                      <strong>Requests are currently PAUSED.</strong>
                      {reasonOnServer ? <div>Reason: {reasonOnServer}</div> : null}
                      {autoResumeAtUtc ? <div>Auto-resumes at: {formatLocal(autoResumeAtUtc)}</div> : <div>No auto-resume set — must be resumed manually.</div>}
                    </>
                  ) : (
                    <strong>Requests are currently ACTIVE.</strong>
                  )}
                </Alert>

                {actionMessage ? (
                  <Alert color="info" className="text-center" toggle={() => setActionMessage("")}>
                    {actionMessage}
                  </Alert>
                ) : null}

                <Form className="complex">
                  <h6 className="heading-small text-muted mb-4">
                    Pause requests
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Reason (shown to users)</label>
                          <Input
                            type="text"
                            placeholder="e.g. Paused for network maintenance, back at 9pm"
                            value={reasonInput}
                            onChange={e => setReasonInput(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label">Auto-resume</label>
                          <Input
                            type="select"
                            value={selectedDuration.label}
                            onChange={e => {
                              const found = DURATION_PRESETS.find(p => p.label === e.target.value);
                              setSelectedDuration(found);
                            }}
                          >
                            {DURATION_PRESETS.map(p => (
                              <option key={p.label} value={p.label}>{p.label}</option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                    {selectedDuration.minutes === "custom" ? (
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label">Custom duration (minutes)</label>
                            <Input
                              type="number"
                              min="1"
                              value={customMinutes}
                              onChange={e => setCustomMinutes(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    ) : null}
                    <Row>
                      <Col className="text-right">
                        <button className="btn btn-icon btn-3 btn-danger" onClick={onPause} disabled={isSaving} type="button">
                          <span className="btn-inner--icon"><i className="fas fa-pause"></i></span>
                          <span className="btn-inner--text">Pause Requests</span>
                        </button>
                        <button className="btn btn-icon btn-3 btn-success" onClick={onResume} disabled={isSaving || !isPaused} type="button">
                          <span className="btn-inner--icon"><i className="fas fa-play"></i></span>
                          <span className="btn-inner--text">Resume Requests</span>
                        </button>
                      </Col>
                    </Row>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col className="order-xl-1" xl="12">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Blocked Attempts</h3>
                  </Col>
                  <Col className="text-right" xs="4">
                    <Button color="secondary" size="sm" onClick={onClearBlockedAttempts}>
                      Clear
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {blockedAttempts.length === 0 ? (
                  <p className="text-muted mb-0">No blocked attempts recorded.</p>
                ) : (
                  <Table className="align-items-center table-flush" responsive>
                    <thead className="thead-light">
                      <tr>
                        <th scope="col">User</th>
                        <th scope="col">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockedAttempts.map((attempt, index) => (
                        <tr key={index}>
                          <td>{attempt.username}</td>
                          <td>{formatLocal(attempt.atUtc)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
    </>
  );
}

export default Administration;
