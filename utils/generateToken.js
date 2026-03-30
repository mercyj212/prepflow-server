import crpto from 'crypto';

const generateToken = () => {
  return crpto.randomBytes(32).toString('hex');
};

export default generateToken;