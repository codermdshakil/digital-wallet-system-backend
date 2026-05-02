import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync( async (req:Request, res:Response) => {

  
  const result = await UserServices.createUser(req.body);
   
  sendResponse(res, {
    statusCode:StatusCodes.CREATED,
    success:true,
    message:"User created Successfully!",
    data:result
  })
  
})

const getAllUsers = catchAsync( async (req:Request, res:Response) => {
 
  const query = req.query as Record<string, string>;

  const result = await UserServices.getAllUsers(query)
   
  sendResponse(res, {
    statusCode:StatusCodes.OK,
    success:true,
    message:"User Retrived Successfully!",
    data:result.data
  })

})

const getSingleUser = catchAsync( async (req:Request, res:Response) => {

  const userId = req.params.id;

  
  const result = await UserServices.getSingleUser(userId as string);
   
  sendResponse(res, {
    statusCode:StatusCodes.OK,
    success:true,
    message:"User Retrived Successfully!",
    data:result
  })

})

const updateUser = catchAsync( async (req:Request, res:Response) => {
  
  const userId = req.params.id;

  const result = await UserServices.updateUser(userId as string,req.body);
   
  sendResponse(res, {
    statusCode:StatusCodes.OK,
    success:true,
    message:"User Updated Successfully!",
    data:result
  })

})

const deleteUser = catchAsync( async (req:Request, res:Response) => {

  const userId = req.params.id;
  
  const result = await UserServices.deleteUser(userId as string)
   
  sendResponse(res, {
    statusCode:StatusCodes.OK,
    success:true,
    message:"User Deleted Successfully!",
    data:result
  })

})


export const UserController = {
  createUser,
  getSingleUser,
  getAllUsers,
  updateUser,
  deleteUser  
}

