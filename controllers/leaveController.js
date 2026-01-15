const {
    handleGetLeaveHistory,
    handleGetLeaveRequest,
    handleApproveRequest,
    handleRejectRequest,
    handleMakeRequest
} = require('../services/leaveService')

async function getLeaveHistory(req, res, next) {
    try {
        const user_id = req.user_id
        const school_id = req.school_id

        const data = await handleGetLeaveHistory(school_id, user_id)
        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

async function getLeaveRequests(req, res, next) {
    try {
        const user_id = req.user_id
        const school_id = req.school_id

        const data = await handleGetLeaveRequest(school_id, user_id)
        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

async function approveLeave(req, res, next) {
    try {
        const school_id = req.school_id
        const req_id = req.params.reqid

        const data = await handleApproveRequest(school_id, req_id)
        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

async function rejectLeave(req, res, next) {
    try {
        const school_id = req.school_id
        const req_id = req.params.reqid

        const data = await handleRejectRequest(school_id, req_id)
        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

async function MakeRequest(req,res,next) {
    try{
        const school_id=req.school_id
        const class_id=req.body.class_id
        const student_id=req.user_id
        const start_date=req.body.start_date
        const end_date=req.body.end_date ?? start_date
        const reason=req.body.reason ?? ''
        data=await handleMakeRequest(school_id,student_id,class_id,reason,start_date,end_date)
        return res.status(200).json(data)
    }catch(error){
        next(error)
    }
}

module.exports = {
    getLeaveHistory,
    getLeaveRequests,
    approveLeave,
    rejectLeave,
    MakeRequest
}
