package com.catalogue.payment.mapper;

import com.catalogue.payment.dto.PaymentDTO;
import com.catalogue.payment.entity.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    PaymentDTO toDTO(Payment payment);

    Payment toEntity(PaymentDTO paymentDTO);
}

