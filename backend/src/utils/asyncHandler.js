
export const asyncHandler = async (requestHandler) => {
    return async function(req,res,next){
        try {
            await requestHandler(req,res,next)
        } catch (error) {
            console.error("some error occured",error)
            next(error)
        }
    }
}   