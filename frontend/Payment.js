import React, { useContext, useState, useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Paper,
  Button,
  Container,
  Snackbar,
  Grid,
  ExpansionPanelActions,
} from "@material-ui/core";
import { Typography, makeStyles, FormGroup, Switch } from "@material-ui/core";
import { FilterContext } from "../../../contexts/FilterContext";
import { UploadContext } from "../../../contexts/UploadContext";
import { Alert, getUser, nfObject } from "../../../utils/Utils";
import axios from "axios";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

const ExpansionPanel = withStyles({
  root: {
    border: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: "rgba(0, 0, 0, .03)",
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
    marginBottom: -1,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiExpansionPanelDetails);

const useStyles = makeStyles((theme) => ({
  titles: {
    padding: 10,
    marginTop: "-20px",
    marginBottom: "10px",
    marginLeft: "-15px",
  },
  featured: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 30,
  },
  margin: {
    marginTop: 120,
  },
  phone: {
    marginTop: 10,
  },
}));

const Payment = ({ toUpload }) => {
  const classes = useStyles();
  const { type, location } = useContext(FilterContext);
  const [payment, setPayment] = useState({
    phone: "",
    amount: "",
  });
  const [disabled, setDisabled] = useState(true);
  const [errors, setErrors] = useState({
    hasError: false,
    message: "",
    severity: "error",
  });
  const { price } = useContext(UploadContext);
  const [expanded, setExpanded] = useState("panel1");
  const [state, setState] = useState({
    checkedA: false,
  });

  const handleChange = (e) => {
    setPayment({ phone: e.target.value });
    if (!regCheck(e.target.value)) {
      setDisabled(true);
      if (e.target.value.length < 10) {
        setDisabled(true);
      } else {
        if (!regCheck(e.target.value)) {
          setErrors({
            hasError: true,
            message: "Please enter a valid safaricom number to continue",
            severity: "error",
          });
        }
      }
    } else {
      setDisabled(false);
    }
  };

  const regCheck = (str) => {
    return str.match(
      /^(?:254|\+254|0)?(7(?:(?:[129][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/
    );
  };

  const onBlur = (e) => {
    if (!regCheck(e.target.value)) {
      setErrors({
        hasError: true,
        message: "Please enter a valid safaricom number to continue",
        severity: "error",
      });
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  };

  const handleExpansion = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const handleSwitching = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setErrors({ hasError: false });
  };

  const set = (obj, prop, value) => {
    obj[prop] = value;
  };

  const validate = (obj, callback) => {
    const { details, location, pricing, agent, description, gallery } = obj;

    if (description === "" || description === undefined) {
      setErrors({
        hasError: true,
        message:
          "Your listing is missing a description. Please correct or click save on description tab",
        severity: "error",
      });
      return;
    }

    if (details === null || details === undefined || details === {}) {
      setErrors({
        hasError: true,
        message:
          "Your listing is missing details. Please correct or click save on details tab",
        severity: "error",
      });
      return;
    } else {
      for (let [key, value] of Object.entries(details)) {
        set(obj, key, value);
      }
    }

    if (
      gallery === null ||
      gallery === undefined ||
      gallery === [] ||
      gallery.length === 0
    ) {
      setErrors({
        hasError: true,
        message:
          "Your listing is missing a gallery. Please correct or click save on gallery tab",
        severity: "error",
      });
      return;
    }

    if (pricing === null || pricing === undefined || pricing === {}) {
      setErrors({
        hasError: true,
        message:
          "Your listing is missing pricing details. Please correct or click save on pricing tab",
        severity: "error",
      });
      return;
    }

    if (location === null || location === undefined || location === {}) {
      setErrors({
        hasError: true,
        message:
          "Your listing is missing location details. Please correct or click save on location tab",
        severity: "error",
      });
      return;
    } else {
      for (let [key, value] of Object.entries(location)) {
        set(obj, key, value);
      }
    }

    if (agent === null || agent === undefined || agent === {}) {
      setErrors({
        hasError: true,
        message:
          "Your listing is missing agent details. Please correct or click save on agent tab",
        severity: "error",
      });
      return;
    }

    obj["type"] = type.type;
    obj["company"] = agent.company;
    callback(obj);
  };

  const createAmount = (price) => {
    if (price <= 1000000) return 1500;

    if (price > 1000000 && price < 5000000) return 2500;

    if (price > 5000000 && price < 10000000) return 3500;

    if (price > 10000000) return 4500;
  };

  const generateUrl = () => {
    if (location === "services") {
      var newString = location.substring(0, location.length - 1);
      return `http://localhost:4000/api/v1/${location}/create-${newString}`;
    } else return `http://localhost:4000/api/v1/${location}/create-${location}`;
  };

  const createGallery = (obj, callback) => {
    var formData = new FormData();
    for (const key of Object.keys(obj)) {
      formData.append("imgCollection", obj[key]);
    }

    callback(formData);
  };

  const uploadItem = () => {
    validate(toUpload, (final) => {
      final["postedBy"] = getUser().userID;

      const body = { phone: payment.phone, amount: createAmount(price) };

      axios
        .post(`http://localhost:4000/api/v1/payments/pay`, payment, {})
        .then((response) => {
          createGallery(final.gallery, (formData) => {
            axios
              .post(
                `http://localhost:4000/api/v1/gallery/upload-images`,
                formData,
                {}
              )
              .then((res) => {
                final["gallery"] = res.data.userCreated.imgCollection;
                axios.post(generateUrl(), final, {}).then((response) => {});
              });
          });
        });
    });
  };

  return (
    <Container>
      <Paper
        display="flex"
        variant="outlined"
        style={{ margin: 30, padding: 30, position: "relative" }}
        elevation={4}
      >
        <Snackbar
          style={{ marginLeft: "10vw" }}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={errors.hasError}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity={errors.severity}>
            {errors.message}
          </Alert>
        </Snackbar>

        <Typography style={{ paddingBottom: 20 }} variant="h5">
          Payment
        </Typography>

        <Typography>{`You will be required to pay a total of Ksh ${nfObject.format(
          createAmount(price)
        )}.\n\n Choose the payment method that suits you best`}</Typography>

        <FormGroup row className={classes.featured}>
          <FormControlLabel
            label="Feature the listing?"
            control={
              <Switch
                checked={state.checkedA}
                onChange={handleSwitching}
                name="checkedA"
              />
            }
          />
        </FormGroup>

        <ExpansionPanel
          square
          style={{ marginTop: 20 }}
          expanded={expanded === "panel1"}
          onChange={handleExpansion("panel1")}
        >
          <ExpansionPanelSummary
            aria-controls="panel1d-content"
            id="panel1d-header"
          >
            <Typography>M-Pesa</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Typography>
              {`If you choose this method, you will be presented with the lipa na M-pesa dialog. The amount to be paid Ksh ${nfObject.format(
                createAmount(price)
              )}  and
account details will be filled before hand. You only have to input your pin and the transaction will commence. Please ensure you have the required amount in your M-pesa account before proceeding. Thank you!`}
            </Typography>
            <ValidatorForm>
              <TextValidator
                required
                fullWidth
                className={classes.phone}
                value={payment.phone}
                onChange={(e) => handleChange(e)}
                onBlur={(e) => onBlur(e)}
                validators={["isNumber"]}
                errorMessages={["input must be a number"]}
                id="phone"
                label="Enter your safaricom number"
                name="phone"
                variant="filled"
              />
            </ValidatorForm>
          </ExpansionPanelDetails>
          <ExpansionPanelActions>
            <Button
              variant="outlined"
              size="medium"
              color="primary"
              disabled={disabled}
              onClick={uploadItem}
            >
              Upload
            </Button>
          </ExpansionPanelActions>
        </ExpansionPanel>
        <ExpansionPanel
          square
          expanded={expanded === "panel2"}
          onChange={handleExpansion("panel2")}
        >
          <ExpansionPanelSummary
            aria-controls="panel2d-content"
            id="panel2d-header"
          >
            <Typography>Visa</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>Coming soon...</Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel
          square
          expanded={expanded === "panel3"}
          onChange={handleExpansion("panel3")}
        >
          <ExpansionPanelSummary
            aria-controls="panel3d-content"
            id="panel3d-header"
          >
            <Typography>MasterCard</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>Coming soon...</Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Paper>
    </Container>
  );
};

export default Payment;
