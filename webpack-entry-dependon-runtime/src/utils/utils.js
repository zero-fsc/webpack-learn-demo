/*
* @description 获取随机ID
* @author zero_fsc
* @date 2022/09/20 14:58:44
*/
export const getRandomId = () => {
    return `${Math.random(1, 10).toString().substring(2, 5)}-${new Date().getTime()}-${Math.random(0, 10).toString().substring(2, 5)}`
}