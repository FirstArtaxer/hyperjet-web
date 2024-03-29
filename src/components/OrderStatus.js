import React from 'react';
import PropTypes from 'prop-types/prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Dm from "../utils/DataManager";
import Urls from "../utils/URLs";
import axios from "axios";
import OrderCart from "./OrderCart";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {createMuiTheme} from "@material-ui/core";
import {MuiThemeProvider} from "@material-ui/core/styles";


const styles = theme => ({

    layout: {
        width: 'auto',
        height:'auto',
        marginLeft: theme.spacing.unit * 2,
        marginRight: theme.spacing.unit * 2,
        [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
            width: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    }
});

const theme = createMuiTheme({
    direction: 'rtl',
    typography: {
        // Use the system font.
        fontFamily:
            'iran-sans',
    },
    palette: {
        width:'90%',
        primary: {
            // light: will be calculated from palette.primary.main,
            main: '#9929ef',
            // dark: will be calculated from palette.primary.main,
            // contrastText: will be calculated to contast with palette.primary.main
        },
        secondary: {
            light: '#1ab91d',
            main: '#1ab91d',
            // dark: will be calculated from palette.secondary.main,
            contrastText: '#ffffff',
        },
        // error: will us the default color
    },
})

class OrderStatus extends React.Component {


    state={orders:[],open:false,textMsg:''};
    componentDidMount() {
        let user=Dm.getUserData();
        let valid=!!(user);
        if(valid) {
            axios.post(Urls.baseUrl() + "order/getuseronproccessorders",
                {
                token: Dm.getUserData().token,
                message: '',
                key: ''
            },
                {headers: {'Authorization': Urls.getAuthToken()}})
                .then(response => {
                    const orders = response.data;
                    if (orders.length === 0) {
                        this.setState({textMsg: 'هیچ سفارشی در حال انجام وجود ندارد'});
                        this.setState({open: true})
                    } else
                        this.setState({orders: orders})
                })
        }else {
            this.setState({textMsg: 'لطفا ثبت نام کنید'});
                this.setState({open: true});
        }
    }

    backHome(){
        window.location.replace("/");
    }
    render() {
        const { classes } = this.props;


        return (
            <MuiThemeProvider theme={theme}>
            <div>
                <Dialog
                    style={{direction:'rtl'}}
                    open={this.state.open}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle >{"خطا"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {this.state.textMsg}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={()=>this.backHome()} color="secondary" >
                            بازگشت
                        </Button>
                    </DialogActions>
                </Dialog>
                <div className="page-title-bar">
                    <Typography variant="h6" gutterBottom className="page-title">وضعیت سفارش</Typography>
                </div>
                <CssBaseline />
                <main className={classes.layout}>
                    {this.state.orders.map(order=><OrderCart order={order} />)}
                </main>
            </div>
            </MuiThemeProvider>
        );
    }
}

OrderStatus.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(OrderStatus);