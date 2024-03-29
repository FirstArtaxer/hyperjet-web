import React from 'react';
import PropTypes from 'prop-types/prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CssBaseline from '@material-ui/core/CssBaseline';
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
import Urls from "../utils/URLs";
import axios from "axios";
import Loading from "./Loading";
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';



const styles = theme => ({

    layout: {
        width: 'auto',
        direction:'rtl',
        marginLeft: theme.spacing.unit * 2,
        marginRight: theme.spacing.unit * 2,
        [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
            width: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
        fontFamily:'iran-sans',
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
        fontFamily:'iran-sans',
    },
    stepper: {
        padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 5}px`,
    },
    buttons: {
        display: 'flex',
        justifyContent: 'center',
        fontFamily:'iran-sans',
    },
    button: {
        marginTop: theme.spacing.unit * 3,
        marginLeft: theme.spacing.unit,
        background:'#9929ef',
        color:'white',
        // fontFamily:'iran-sans',
    },
    buttonconfirm: {
        marginTop: theme.spacing.unit * 3,
        marginLeft: theme.spacing.unit,
        background:'#1ab91d',
        color:'white',
        // fontFamily:'iran-sans',
    },
});

const theme = createMuiTheme({
    direction: 'rtl',
    typography: {
        // Use the system font.
        fontFamily:
            'iran-sans',

    },
    palette: {
        primary: {
            // light: will be calculated from palette.primary.main,
            main: '#1ab91d',
            // dark: will be calculated from palette.primary.main,
            // contrastText: will be calculated to contast with palette.primary.main
        },
        secondary: {
            light: '#1ab91d',
            main: '#1ab91d',
            // dark: will be calculated from palette.secondary.main,
            contrastText: '#ffcc00',
        },
        // error: will us the default color
    },
})

const steps = [' ثبت شماره موبایل ', ' تایید شماره موبایل'];

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
        msg:false,
        textMsg:'',
        loaded:true,
        cart: Dm.getBasketData()
    };



    handleNext = () => {
        if (this.state.activeStep === 0) {
            let mobile = Dm.getUserMobile();
            if (mobile && mobile.length === 11 && mobile.startsWith('09')) {
                this.getTempToken(mobile);

            } else {
                let text='شماره موبایل صحیح نیست';
                this.setState({textMsg:text});
                this.setState({msg: true})
            }
        }else {
            console.log('=====Active========'+this.state.activeStep);
            this.confirmMobile();

        }
    };
    getTempToken(mobile){
        let url = Urls.baseUrl()+"user/register?mobile="+mobile;

        this.setState({loaded:false});
        axios.post(url, null,{headers:{'Authorization': Urls.getAuthToken(),'OS':'web-app'}})
            .then(response => {
                const temp=response.data;
                this.setState({loaded:true});
                if (temp.message === 'ok') {

                    Dm.setTempToken(temp.tempToken);
                    this.setState(state => ({
                        activeStep: state.activeStep + 1,
                    }));
                }
                else {
                    if (temp.tempToken !== '') {
                        Dm.setTempToken(temp.tempToken);
                        this.setState(state => ({
                            activeStep: state.activeStep + 1,
                        }));
                        this.setState({textMsg:temp.message});
                        this.setState({msg: true});

                    }
                    else {
                        this.setState({textMsg: temp.message});
                        this.setState({msg: true})
                    }
                }
            });
    }
    confirmMobile(){
        let code=Dm.getConfirmCode().code;
        let tempToken=Dm.getTempToken().tempToken;
        let userConfirm={id:tempToken,confirmcode:code,message:''};
        console.log(userConfirm);
        let url = Urls.baseUrl()+"user/confirm";
        this.setState({loaded:false});
        axios.post(url, userConfirm,{headers:{'Authorization': Urls.getAuthToken()}})
            .then(response => {
                const userToken=response.data;
                this.setState({loaded:true});
                if(userToken.message==='ok') {
                    Dm.setToken(userToken.token);
                    this.setState(state => ({
                        activeStep: state.activeStep + 1,
                    }));
                }else {
                    this.setState({textMsg:userToken.message});
                    this.setState({msg: true})
                }
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
    redirectTo(path){
        window.location.replace(path);
    }
    render() {
        const { classes } = this.props;
        const { activeStep } = this.state;

        return (

            <React.Fragment>
                <MuiThemeProvider theme={theme}>
                <CssBaseline />

                <div className="page-title-bar">
                    <Typography variant="h5" gutterBottom className="page-title">ثبت نام</Typography>
                </div>
                <main className={classes.layout}>
                    <Paper className={classes.paper}>
                        <Stepper   activeStep={activeStep} className={classes.stepper}>
                            {steps.map(label => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        <React.Fragment>
                            {(this.state.loaded)?activeStep === steps.length ? (
                                <React.Fragment>
                                    <div style={{textAlign:"center"}} >
                                    <Typography variant="h5" gutterBottom>
                                        به هایپرجت خوش آمدید
                                    </Typography>
                                        <Typography variant="subtitle1">
                                            ثبت نام با موفقیت انجام گردید
                                        </Typography>
                                    <Typography variant="subtitle1">
                                        مشتاقانه جهت خدمتگذاری آماده هستیم
                                    </Typography>
                                    </div>
                                    <div className={classes.buttons} style={{marginTop:"10%"}} >
                                        <Button variant="contained"    className={classes.button}   onClick={()=>this.redirectTo('/')}>بازگشت به صفحه اصلی</Button>

                                    </div>

                                    {(this.state.cart.length > 0) ?
                                            <div className={classes.buttons} >
                                            <Button variant="contained"    className={classes.button} onClick={()=>this.redirectTo('/user/checkout')}> بررسی خرید</Button>
                                             </div> : ''}
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    {getStepContent(activeStep)}
                                    <div className={classes.buttons} >
                                        {activeStep === 1 && (
                                            <Button onClick={this.handleBack} className={classes.button}>
                                                مرحله قبل
                                            </Button>
                                        )}
                                        {activeStep === 0 && (
                                        <Button
                                            variant="contained"
                                            onClick={this.handleNext}
                                            className={classes.button}
                                        >
                                            مرحله بعدی
                                        </Button>
                                        )}
                                        {activeStep === 1 && (
                                        <Button
                                            variant="contained"
                                            onClick={this.handleNext}
                                            className={classes.buttonconfirm}
                                        >
                                            ثبت کد تایید
                                        </Button>
                                        )}
                                    </div>
                                    <Snackbar
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        }}
                                        open={this.state.msg}
                                        autoHideDuration={4000}
                                        onClose={this.handleClose}
                                        ContentProps={{
                                            'aria-describedby': 'message-id',
                                        }}
                                        message={<span id="message-id">{this.state.textMsg}</span>}
                                    />
                                </React.Fragment>
                            ):<Loading />}
                        </React.Fragment>
                    </Paper>
                </main>
                </MuiThemeProvider>
            </React.Fragment>

        );
    }
}

Registration.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(Registration);

