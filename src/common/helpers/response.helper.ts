export const buildResponse = (message: string, content: any = null) => {
  return { 
    statusCode: 200, 
    message, 
    content, 
    dateTime: new Date().toISOString() 
  };
};
