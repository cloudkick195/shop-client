const { getAllPolicyPost,
    getPolicyPostBySlug } = require('./../repositories/privacy-policy.repo');
const { reqValidator } = require('./../utils/validators/request.validate');

const getAllPrivacyPolicy = async (req, res) => {
    try {
        return getAllPolicyPost();
    } catch (error) {
        throw new Error(error);
    }
}

const getPrivacyPolicyBySlug = async (req, res) => {
    try {
        const validation = {
            'slug': {type: ['text']}
        }
       
        const data = req.params;
       
        const errors = reqValidator(validation, data);
        if(Object.keys(errors)[0]){
            return res.redirect("/");
        }
       
        const page = await getPolicyPostBySlug(data.slug)
        
        return res.cRender('home/page.pug', { title: page.post_name, content: page.post_content }); 
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = { getAllPrivacyPolicy, getPrivacyPolicyBySlug };