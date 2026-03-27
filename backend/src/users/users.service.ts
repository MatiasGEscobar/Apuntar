import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities/users.entity';
import { UsersRepository } from './users.repository';
import { updateUserDto } from 'src/dto/updateUserDto';

@Injectable()
export class UsersService {
    constructor (private readonly usersRepository : UsersRepository){}

    getUsers(){
        return this.usersRepository.getUsers();
    }

    getUsersTrainer(){
        return this.usersRepository.getUsersTrainer();
    }

    getUsersClient(){
        return this.usersRepository.getUsersClient();
    }

    getUserById(id: string){
        return this.usersRepository.getById(id)
    }

    getRoleByUserId(id: string){
        return this.usersRepository.getRoleByUserId(id)
    }

    async getSubscriptionsByUserId(id: string) {
        return this.usersRepository.getSubscriptions(id);
    }

    getUserByIdAndRole(id: string, role: string){
        return this.usersRepository.getUserByIdAndRole(id, role)
    }

    updateUserName(id: string, userName: updateUserDto) {                                  
        return this.usersRepository.updateUserName(id, userName);
    }

    updateRoleUser(id: string, role: string){
        return this.usersRepository.updateRoleUser(id, role)
    }

    async userExists(id: string): Promise<boolean> {
        try {
            const user = await this.usersRepository.getById(id);
            return !!user;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return false;
        }
    }    

    deleteUser(id:string){
        return this.usersRepository.deleteUser(id)
    }

    desactivateUser(id:string){
        return this.usersRepository.desactivateUser(id)
    }

    activateUser(id:string){
        return this.usersRepository.activateUser(id)
    }


}
