import React from 'react';
import PropTypes from 'prop-types/prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Dm from "../utils/DataManager";
import Urls from "../utils/URLs";
import axios from "axios";
import PreviousOrderCart from "./PreviousOrderCart";
import BackIcon from '@material-ui/icons/Close';
import Slide from "@material-ui/core/Slide";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import InfiniteScroll from "react-infinite-scroll-component";
import CircularProgress from "@material-ui/core/CircularProgress";
import CSSTransitionGroup from "react-transition-group/CSSTransitionGroup";
import {createMuiTheme, MuiThemeProvider} from "@material-ui/core/styles";
import NumberFormat from "react-number-format";



const styles = theme => ({
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
        direction: 'rtl'
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

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class PreviousOrders extends React.Component {

    state={
        orders:[],
        open:false,
        products:[],
        openAlarm: false,
        textMsg:'',
        items: [],
        hasMore: true,
        page:0
    };

    handleClickOpen(orderid) {

        axios.post(Urls.baseUrl()+"order/getorderproducts",{token:Dm.getUserData().token,message:'',key:orderid}, {headers:{'Authorization': Urls.getAuthToken()}})
            .then(response => {
                const products=response.data;
                this.setState({products:products})
            });
        this.setState({open:true});
    }

    handleClose() {
        this.setState({open:false});
        this.setState({products:[]})
    }


    componentDidMount() {

        let user=Dm.getUserData();
        let valid=!!(user);
        if(valid) {
        axios.post(Urls.baseUrl()+"order/getuserorders",{token:Dm.getUserData().token,message:'',key:''}, {headers:{'Authorization': Urls.getAuthToken()}})
            .then(response => {
                const orders=response.data;
                if (orders.length === 0) {
                    this.setState({textMsg: 'هیچ سفارشی ثبت نشده است'});
                    this.setState({openAlarm: true})
                } else {
                    this.setState({orders: orders});
                    this.setState({items: orders.slice(0, (orders.length>=7)?7:orders.length)});
                }
            });

        }else {
            this.setState({textMsg: 'کاربر معتبر نیست,لطفا ثبت نام کنید'});
            this.setState({openAlarm:true});
        }
    }

    fetchMoreData = () => {
        if (this.state.items.length >= this.state.orders.length) {
            this.setState({ hasMore: false });
            return;
        }
        // a fake async api call like which sends
        // 20 more records in .5 secs
        setTimeout(() => {
            let newPage=this.state.page+1;
            this.setState({page:newPage});
            this.setState({
                items: this.state.items.concat(this.state.orders.slice(this.state.page*7,(this.state.page*7)+7))
            });
        }, 500);
    };

    redirectTo(path){
        window.location.href=(path);
    }
    render() {
        const { classes } = this.props;
        let ordersData=this.state.items.map(order=><div onClick={()=>this.handleClickOpen(order.orderId)}><PreviousOrderCart order={order} /></div>)
        return (
            <MuiThemeProvider theme={theme}>
            <div>
                <Dialog
                    style={{direction:'rtl'}}
                    open={this.state.openAlarm}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{"خطا"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {this.state.textMsg}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={()=>this.redirectTo("/")} color="secondary" >
                            بازگشت
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog style={{direction:'rtl'}} fullScreen open={this.state.open} onClose={()=>this.handleClose()} TransitionComponent={Transition}>
                            <div className="page-title-bar">
                                <Typography variant="h6" gutterBottom className="page-title">کالاها</Typography>
                                <Button className="page-close" color="inherit" onClick={()=>this.handleClose()}>
                                    <BackIcon />
                                </Button>
                            </div>
                        <div >
                        </div>
                    <List >
                        {this.state.products.map(p=>
                            <div>
                                <ListItem button>
                                    <Grid container spacing={24}>
                                        <Grid item xs={12}>
                                            <div style={{textAlign: "right",fontSize:'15px'}}>
                                                    {p.productName}
                                            </div>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <div style={{textAlign: "right"}}>
                                                {p.quantity}عدد
                                            </div>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <div style={{textAlign: "right"}}>
                                                <NumberFormat value={p.price} displayType={'text'} thousandSeparator={true} renderText={value =>  <h4 className="product-price">{value + ' تومان'}</h4>} />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Divider />
                            </div>
                        )}
                    </List>
                </Dialog>
                <div className="page-title-bar">
                    <Typography variant="h6" gutterBottom className="page-title">خرید های گذشته</Typography>
                </div>

                <main className={classes.layout}>
                    <InfiniteScroll
                        dataLength={this.state.items.length}
                        next={this.fetchMoreData}
                        hasMore={this.state.hasMore}
                        loader={
                            <div className="loader-end">
                                <CircularProgress color="secondary"  />
                            </div>
                        }
                        endMessage={
                            <div className="loader-end">
                                <b >پایان محصولات این بخش</b>
                            </div>
                        }
                    >
                        {ordersData}
                    </InfiniteScroll>
          </main>
            </div>
            </MuiThemeProvider>
        );
    }
}

PreviousOrders.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(PreviousOrders);