import React from 'react';
import PropTypes from 'prop-types/prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import SingInForm from './SignIn';
import ConfrimForm from './Confirmation';
import Dm from "../utils/DataManager";
import Snackbar from '@material-ui/core/Snackbar';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import getThemeProps from "@material-ui/core/es/styles/getThemeProps";
import Urls from "../utils/URLs";
import axios from "axios";


const styles = theme => ({
    appBar: {
        position: 'relative',
    },
    layout: {
        width: 'auto',
        marginLeft: theme.spacing.unit * 2,
        marginRight: theme.spacing.unit * 2,
        [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
            width: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 3,
        marginBottom: theme.spacing.unit * 3,
        padding: theme.spacing.unit * 2,
        [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
            marginTop: theme.spacing.unit * 6,
            marginBottom: theme.spacing.unit * 6,
            padding: theme.spacing.unit * 3,
        },
    },
    stepper: {
        padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 5}px`,
    },
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    button: {
        marginTop: theme.spacing.unit * 3,
        marginLeft: theme.spacing.unit,
    },
});

const steps = ['ثبت شماره موبایل', 'تایید شماره موبایل'];

function getStepContent(step) {
    switch (step) {
        case 0:
            return <SingInForm />;
        case 1:
            return <ConfrimForm />;

        default:
            throw new Error('Unknown step');
    }
}

class Registration extends React.Component {
    state = {
        activeStep: 0,
        mobile:'',
        msg:false
    };



    handleNext = () => {
        if (this.state.activeStep === 0) {
            let mobile = Dm.getUserMobile();
            if (mobile && mobile.length === 11 && mobile.startsWith('09')) {
                this.getTempToken(mobile);
                this.setState(state => ({
                    activeStep: state.activeStep + 1,
                }));

            } else {
                this.setState({msg: true})
            }
        }else {
            console.log('=====Active========'+this.state.activeStep);
            this.confirmMobile();
            this.setState(state => ({
                activeStep: state.activeStep + 1,
            }));
        }
    };
    getTempToken(mobile){

        let url = Urls.baseUrl()+"user/register?mobile="+mobile;
        axios.post(url, null,{headers:{'Authorization': Urls.getAuthToken()}})
            .then(response => {
                const temp=response.data;
                Dm.setTempToken(temp.tempToken);
            });
    }
    confirmMobile(){
        let code=Dm.getConfirmCode().code;
        let tempToken=Dm.getTempToken().tempToken;
        let userConfirm={id:tempToken,confirmcode:code,message:''};
        console.log(userConfirm);
        let url = Urls.baseUrl()+"user/confirm";
        axios.post(url, userConfirm,{headers:{'Authorization': Urls.getAuthToken()}})
            .then(response => {
                const userToken=response.data;
                Dm.setToken(userToken.token);
            });
    }

    handleBack = () => {
        this.setState(state => ({
            activeStep: state.activeStep - 1,
        }));
    };

    handleClose=()=>{
        this.setState({msg:false})
    };

    handleReset = () => {
        this.setState({
            activeStep: 0,
        });
    };

    render() {
        const { classes } = this.props;
        const { activeStep } = this.state;

        return (
            <React.Fragment>
                <CssBaseline />

                <main className={classes.layout}>
                    <Paper className={classes.paper}>
                        <Typography component="h1" variant="h4" align="center">
                            ثبت نام
                        </Typography>
                        <Stepper activeStep={activeStep} className={classes.stepper}>
                            {steps.map(label => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        <React.Fragment>
                            {activeStep === steps.length ? (
                                <React.Fragment>
                                    <Typography variant="h5" gutterBottom>
                                        به هایپرجت خوش آمدید
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        مشتاقانه جهت خدمتگذاری آماده هستیم
                                    </Typography>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    {getStepContent(activeStep)}
                                    <div className={classes.buttons}>
                                        {activeStep !== 0 && (
                                            <Button onClick={this.handleBack} className={classes.button}>
                                                Back
                                            </Button>
                                        )}

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={this.handleNext}
                                            className={classes.button}
                                        >
                                            {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
                                        </Button>

                                    </div>
                                    <Snackbar
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        }}
                                        open={this.state.msg}
                                        autoHideDuration={6000}
                                        onClose={this.handleClose}
                                        ContentProps={{
                                            'aria-describedby': 'message-id',
                                        }}
                                        message={<span id="message-id">شماره موبایل صحیح نیست</span>}
                                        action={[

                                            <IconButton
                                                key="close"
                                                aria-label="Close"
                                                color="inherit"
                                                className={classes.close}
                                                onClick={this.handleClose}
                                            >
                                                <CloseIcon />
                                            </IconButton>,
                                        ]}
                                    />
                                </React.Fragment>
                            )}
                        </React.Fragment>
                    </Paper>
                </main>
            </React.Fragment>
        );
    }
}

Registration.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(Registration);