import Listing from "../models/listing.model.js";


export const creatListing = async (req, res, next) => {

    try {

        const listing = await Listing.create(req.body);
        console.log("I am in listing page " + listing );
        return res.status(201).json(listing);

        
    } catch (error) {
        console.log("I am in error page ");
        next(error);
    }
}

